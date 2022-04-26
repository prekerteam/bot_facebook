<?php

class ApiClass
{

  function getCookies($data){
      $login = curl_init();
      curl_setopt($login, CURLOPT_TIMEOUT, 40);
      curl_setopt($login, CURLOPT_RETURNTRANSFER, TRUE);
      curl_setopt($login, CURLOPT_URL, 'https://d.facebook.com/login.php');
      curl_setopt($login, CURLOPT_USERAGENT,'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)');
      curl_setopt($login, CURLOPT_HEADER, 1);
      curl_setopt($login, CURLOPT_FOLLOWLOCATION, TRUE);
      curl_setopt($login, CURLOPT_HTTPHEADER,$ip);
      curl_setopt($login, CURLOPT_POST, TRUE);
      curl_setopt($login, CURLOPT_POSTFIELDS, $data);
      ob_start();

      $body = curl_exec($login) or die(curl_error($login));
      return $body;
      ob_end_clean();
      curl_close ($login);
      unset($login);
  }

  function get($url,$cookie){
      $headers[] = "Accept: */*";
      $headers[] = "Connection: Keep-Alive";
      $headers[] = "cookie: $cookie";
      $ch = curl_init();
      curl_setopt($ch, CURLOPT_HTTPHEADER,  $headers);
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
      curl_setopt($ch, CURLOPT_USERAGENT,'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)');
      curl_setopt($ch, CURLOPT_TIMEOUT, 60);
      curl_setopt($ch, CURLOPT_URL, $url);
      ob_start();
      return curl_exec ($ch);
      ob_end_clean();
      curl_close ($ch);
  }

  function getToken($cookies){
    $getdata = $this->get('https://business.facebook.com/business_locations',$cookies);
    preg_match('/"EAAG(.*?)"/',  $getdata,  $gettoken);
    $token = str_replace('"','',$gettoken[0]);
    if (!empty($token)) {
        $profile = $this->get('https://graph.facebook.com/v11.0/me?fields=id%2Cname%2Cbirthday&access_token='.$token,$cookies);
        $result = json_decode($profile,true);
        $dataresult = [
            'response' => 200,
            'user' => $result,
            'session' => [
                'cookies' => $cookies,
                'token' => $token
            ]
        ];
    }else {
      $dataresult = [
          'response' => 500,
          'message' => 'Akun Dinonaktifkan!',
          'tes' => $alert
      ];
    }
    return $dataresult;
  }

  function loginAccount($data){
        $body = $this->getCookies($data);
        preg_match('/checkpoint(.*?)"/',  $body,  $alert);//sandi salah
        if (empty($alert[0])) {
          preg_match_all('/^Set-Cookie:\s*([^;]*)/mi', $body, $grab);
          $cookiar = array();
          foreach ($grab[1] as $value) {
            parse_str($value, $cook);
            $cookiar = array_merge($cookiar, $cook);
          }
          if (!empty($cookiar['c_user'])) {
            $cookies = implode("; ",$grab[1]);
            $dataresult = $this->getToken($cookies);
          }else {
            $dataresult = [
                'response' => 400,
                'message' => 'Username atau sandi salah!',
                'tes' => $login
            ];
          }
        }else {
          $dataresult = [
              'response' => 300,
              'message' => 'Akun Locked!',
              'tes' => $alert
          ];
        }
        return $dataresult;
  }

  function grapfriends($uid,$token,$after,$cookies){

      function remove_bs($Str) {
        $StrArr = str_split($Str); $NewStr = '';
        foreach ($StrArr as $Char) {
          $CharNo = ord($Char);
          if ($CharNo == 163) { $NewStr .= $Char; continue; } // keep £
          if ($CharNo > 31 && $CharNo < 127) {
            $NewStr .= $Char;
          }
        }
        return $NewStr;
      }

      function filter($string){
        $result = preg_replace("/[^a-z0-9A-Z]/", "", $string);
        return $result;
      }

      function arr_unique($arr) {
        sort($arr);
        $curr = $arr[0];
        $uni_arr[] = $arr[0];
        for($i=0; $i<count($arr);$i++){
            if($curr != $arr[$i]) {
              $uni_arr[] = $arr[$i];
              if ($arr[$i] !== null) {
                $curr = $arr[$i];
              }
            }
        }
        return $uni_arr;
      }

      $access_token = "&access_token=".$token;
      $fild = "fields=id,first_name,last_name,name,middle_name,short_name,birthday,location{location{city,region,country,country_code}},hometown{location{city,region,country,country_code}}&limit=2500";
      if ($after) {
        $result = $this->get($uid . "/friends",$fild.$access_token.'&after='.$after,$cookies);
      }else {
        $result = $this->get($uid . "/friends",$fild.$access_token,$cookies);
      }

      $array = json_decode($result,true);
      $data = [];
      foreach ($array['data'] as $d) {
        $did['detail'] = arr_unique([
          filter($d['first_name']),
          filter($d['last_name']),
          filter($d['name']),
          filter($d['short_name']),
          filter($d['birthday']),
          filter($d['location']['location']['city']),
          filter($d['hometown']['location']['city'])
        ]);
        $did['id'] = [$d['id']];
        array_push($data,$did);

      }

      if ($array['paging']['cursors']['after']) {
        $tampildat = [
          'data' => $data,
          'after' => $array['paging']['cursors']['after']
        ];
      }else {
        $tampildat = [
          'data' => $data
        ];
      }

      return $tampildat;
  }
}
