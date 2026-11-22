<?php
// PHP 7.4+ with OpenSSL; SMTP submission using verified STARTTLS.
function failPage($status,$message){http_response_code($status);header('Content-Type: text/html; charset=UTF-8');echo '<!doctype html><html><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="assets/style.css"><title>Inquiry | Mech Equip International</title><body><main class="section"><div class="container"><h2>Inquiry not submitted</h2><p>'.htmlspecialchars($message,ENT_QUOTES,'UTF-8').'</p><a class="btn" href="contact.html">Back to Contact</a></div></main></body></html>';exit;}
if(($_SERVER['REQUEST_METHOD']??'')!=='POST')failPage(405,'Please use the contact form.');
function field($key,$max){$v=$_POST[$key]??'';if(!is_string($v)||strlen($v)>$max)failPage(422,'Please check your form details.');return trim($v);}
$name=field('name',120);$company=field('company',160);$email=field('email',254);$phone=field('phone',24);$product=field('product',180);$message=field('message',4000);$source=field('source',2048);
if(field('website',200)!=='')failPage(422,'Invalid submission.');
$digits=preg_replace('/\D/','',$phone);
if(!$name||!filter_var($email,FILTER_VALIDATE_EMAIL)||!preg_match('/^\+?[0-9 ]+$/D',$phone)||strlen($digits)<7||strlen($digits)>15)failPage(422,'Enter a valid name, email and phone number (7–15 digits).');
$c=require __DIR__.'/inquiry-config.php';
function esc($s){return htmlspecialchars($s,ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8');}
$lead=strtoupper(bin2hex(random_bytes(4)));$subject='Website Inquiry - Mech Equip International (lead#'.$lead.')';
$body='<html><body style="background:#f1f3f5;font-family:Arial,sans-serif;padding:24px"><div style="max-width:700px;margin:auto;background:#fff"><div style="background:#0d2b46;color:#fff;text-align:center;padding:20px;font-size:20px;font-weight:bold">Mech Equip International</div><div style="padding:24px"><h2 style="font-size:19px">'.esc($subject).'</h2><table style="border-collapse:collapse;width:100%;font-size:14px">';
foreach(['Name'=>$name,'Company'=>$company,'Email'=>$email,'Phone'=>$phone,'Product / Requirement'=>$product,'Message'=>$message,'Source Page'=>$source] as $k=>$v){$body.='<tr><th style="border:1px solid #dce2e8;padding:14px;text-align:left;width:36%">'.esc($k).'</th><td style="border:1px solid #dce2e8;padding:14px">'.nl2br(esc($v)).'</td></tr>';}$body.='</table></div></div></body></html>';
function smtpRead($s,$expected){$lines='';do{$line=fgets($s,8192);if($line===false)throw new RuntimeException('SMTP response unavailable');$lines.=$line;}while(isset($line[3])&&$line[3]==='-');if(!in_array((int)substr($line,0,3),(array)$expected,true))throw new RuntimeException('SMTP rejected command: '.substr($line,0,3));return $lines;}
function smtpWrite($s,$data){while(strlen($data)){ $n=fwrite($s,$data);if(!$n)throw new RuntimeException('SMTP write failed');$data=substr($data,$n);}}
function smtpCmd($s,$cmd,$code){smtpWrite($s,$cmd."\r\n");return smtpRead($s,$code);}
$s=null;
try{
 $ctx=stream_context_create(['ssl'=>['verify_peer'=>true,'verify_peer_name'=>true,'peer_name'=>$c['host']]]);
 $s=stream_socket_client('tcp://'.$c['host'].':'.$c['port'],$errno,$errstr,20,STREAM_CLIENT_CONNECT,$ctx);if(!$s)throw new RuntimeException('SMTP connection failed');stream_set_timeout($s,20);smtpRead($s,220);
 $caps=smtpCmd($s,'EHLO '.$c['ehlo'],250);if(stripos($caps,'STARTTLS')===false)throw new RuntimeException('SMTP STARTTLS unavailable');smtpCmd($s,'STARTTLS',220);if(stream_socket_enable_crypto($s,true,STREAM_CRYPTO_METHOD_TLS_CLIENT)!==true)throw new RuntimeException('SMTP TLS failed');$caps=smtpCmd($s,'EHLO '.$c['ehlo'],250);
 if(preg_match('/AUTH[^\r\n]*\bLOGIN\b/i',$caps)){smtpCmd($s,'AUTH LOGIN',334);smtpCmd($s,base64_encode($c['username']),334);smtpCmd($s,base64_encode($c['password']),235);}else{smtpCmd($s,'AUTH PLAIN '.base64_encode("\0".$c['username']."\0".$c['password']),235);}
 smtpCmd($s,'MAIL FROM:<'.$c['from'].'>',250);smtpCmd($s,'RCPT TO:<'.$c['to'].'>',[250,251]);smtpCmd($s,'DATA',354);
 $headers=['Date: '.date(DATE_RFC2822),'From: '.$c['from_name'].' <'.$c['from'].'>','To: '.$c['to'],'Reply-To: '.$email,'Subject: '.$subject,'Message-ID: <'.bin2hex(random_bytes(12)).'@'.$c['ehlo'].'>','MIME-Version: 1.0','Content-Type: text/html; charset=UTF-8','Content-Transfer-Encoding: base64'];
 smtpWrite($s,implode("\r\n",$headers)."\r\n\r\n".chunk_split(base64_encode($body),76,"\r\n").".\r\n");smtpRead($s,250);fclose($s);header('Location: thankyou.html',true,303);exit;
}catch(Throwable $e){if(is_resource($s))fclose($s);error_log('Mech Equip inquiry: '.$e->getMessage());failPage(503,'Unable to send your inquiry right now. Please try again or contact us by phone.');}
