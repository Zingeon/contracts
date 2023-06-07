<?php

namespace App\Document;

use Doctrine\ODM\MongoDB\Mapping\Annotations as MongoDB;

/**
 * @MongoDB\Document(collection="transactions")
 */
class Transaction
{
    /**
     * @MongoDB\Id(strategy="auto")
     */
    private $id;

    /**
     * @MongoDB\Field(type="string")
     */
    private $transactionFrom;

    /**
     * @MongoDB\Field(type="string")
     */
    private $transactionTo;
}
