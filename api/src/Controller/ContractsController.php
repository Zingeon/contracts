<?php

namespace App\Controller;

use App\Document\Transaction;
use Doctrine\ODM\MongoDB\DocumentManager;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Doctrine\ODM\MongoDB\Query\Expr;

class ContractsController extends AbstractController
{
    #[Route('/contracts', name: 'app_contracts')]
    public function index(Request $request, DocumentManager $documentManager): Response
    {
        $contracts = explode(',', $request->query->get('contracts'));

        foreach ($contracts as $contract) {
            if (!is_string($contract) || !$contract) {
                return new JsonResponse(
                    ['error' => 'Invalid smart contract. It should be a string'], 
                    JsonResponse::HTTP_BAD_REQUEST
                );
            }
        }

        $blockAggregationBuilder = $documentManager->createAggregationBuilder(Transaction::class);

        $blockAggregationBuilder
            ->match()
                ->field('transactionTo')->in($contracts)
            ->group()
                ->field('_id')->expression(null) 
                ->field('transactionsCount')
                ->sum(1) 
                ->field('uniqueTransactionsFrom')->addToSet('$transactionFrom') 
            ->project()
                ->field('_id')->literal(null)
                ->field('transactionsCount')->expression('$transactionsCount')
                ->field('uniqueTransactionsFromCount')->expression(['$size' => '$uniqueTransactionsFrom']);
            
        $result = $blockAggregationBuilder->execute()->current();

        if (!$result){
            return new JsonResponse(
                ['error' => 'Resource not found'], 
                JsonResponse::HTTP_NOT_FOUND
            );
        }

        return new JsonResponse([
            'transactionsCount' => $result['transactionsCount'],
            'uawCount' => $result['uniqueTransactionsFromCount'],
        ]);
    }
}
