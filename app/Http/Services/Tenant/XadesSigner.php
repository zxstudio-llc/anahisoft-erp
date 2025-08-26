<?php

namespace App\Http\Services\Tenant;

/**
 * Minimal XAdES-BES signer using xmlseclibs.
 * Requires composer: composer require robrichards/xmlseclibs:^3.1 
 */
use RobRichards\XMLSecLibs\XMLSecurityDSig;
use RobRichards\XMLSecLibs\XMLSecurityKey;

class XadesSigner
{
    private $cert;
    private $pkey;

    public function __construct(string $p12Path, string $password)
    {
        $p12 = file_get_contents($p12Path);
        if (!openssl_pkcs12_read($p12, $creds, $password)) {
            throw new \RuntimeException('Unable to read P12/PFX. Check password.');
        }
        $this->cert = $creds['cert'];
        $this->pkey = $creds['pkey'];
    }

    public function sign(string $xml): string
    {
        $doc = new \DOMDocument();
        $doc->preserveWhiteSpace = false;
        $doc->formatOutput = false;
        $doc->loadXML($xml);

        // Create signature
        $objDSig = new XMLSecurityDSig('ds');
        $objDSig->setCanonicalMethod(XMLSecurityDSig::EXC_C14N);
        $objDSig->addReference(
            $doc,
            XMLSecurityDSig::SHA256,
            ['http://www.w3.org/2000/09/xmldsig#enveloped-signature'],
            ['id_name' => 'Id', 'overwrite' => true]
        );

        $objKey = new XMLSecurityKey(XMLSecurityKey::RSA_SHA256, ['type'=>'private']);
        $objKey->loadKey($this->pkey, false);
        $objDSig->sign($objKey);

        // Add KeyInfo/X509
        $objDSig->add509Cert($this->cert, true, false, ['subjectName' => true]);

        // Append ds:Signature as last child
        $root = $doc->documentElement;
        $root->appendChild($objDSig->sigNode);

        return $doc->saveXML();
    }
}