<?php
if (isset($_POST["save"]) && !empty($_POST["save"])) {
    saveToFile($_POST["save"]);
}

function saveToFile($resultsArray) {


    $existingData = file_get_contents("database.txt");
    $existingResults = [];
    if ($existingData) {
        $decodedData = json_decode($existingData);
        if ($decodedData->content) {
            $existingResults = $decodedData->content;
        }   
    }

    $existingResults[] = $resultsArray; 

    $object = new StdClass();
    $object->last_modified = time();
    $object->content = $existingResults;
    $jsonString = json_encode($object);
    file_put_contents("database.txt", $jsonString);
}
?>
