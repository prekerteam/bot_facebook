<?php
header('Content-Type: application/json');
require_once "assets/ApiClass.php";

$api = new ApiClass();

$request_method=$_SERVER["REQUEST_METHOD"];
switch ($request_method) {
   case 'GET':
     if($_GET['field'] == 'Login'){
         $data = [
         'email' => $_GET['email'],
         'pass' => $_GET['pass'],
         'login' => 'Login'
         ];
         echo json_encode($api->loginAccount($data));
     }else if ($_GET['field'] == "getToken"){
       $cookies = $_GET['cookies'];
       echo json_encode($api->getToken($cookies));
     }else if($_GET['field'] == 'friends'){
        $uid = $_GET['uid'];
        $token = $_GET['token'];
        $cookies = $_GET['cookies'];
        $after = $_GET['after'];
        echo json_encode($api->grapfriends($uid,$token,$after,$cookies));
     }
   break;
   case 'POST':
     if($_POST['field'] == 'Login'){
         $data = [
         'email' => $_POST['email'],
         'pass' => $_POST['pass'],
         'login' => 'Login'
         ];
         echo json_encode($api->loginAccount($data));
     }else if ($_POST['field'] == "Cookies"){
       $cookies = $_POST['cookies'];
       echo json_encode($api->getToken($cookies));

     }
   break;
default:
 // Invalid Request Method
  header("HTTP/1.0 405 Method Not Allowed");
  $home = [
    'home' => '/'
  ];
  echo json_encode($home);
  break;
break;
}
