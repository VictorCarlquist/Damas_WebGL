<?php
$errno = 0;
$errstr = "";

$s = stream_socket_server("tcp://192.168.0.9:33333", $errno, $errstr, STREAM_SERVER_BIND|STREAM_SERVER_LISTEN);

if($s == false) {
    echo "FAILED ".$errno." ".$errstr."\r\n";
}else{

    $clients = array();
    $authed = array();
    $listeners = array();
    $listeners[] = $s;
    $users = array();

    while(true) {
        usleep(1);

        $read = array_merge(array_values($clients), array_values($listeners));

        if(stream_select($read, $write = NULL, $except = NULL, 0) > 0) {

            foreach($listeners as $listener) {

                // Check if its a new socket or not
                if(in_array($listener, $read) && !in_array($read, $clients)) {

                    // Accept new client
                    $clients[]= $newsock = @stream_socket_accept($listener);
                    stream_set_timeout($newsock, 1);
                    stream_set_blocking($newsock, 0);

                    echo "Accepted new client\n";

                    // remove the listening socket from the clients-with-data array
                    $key = array_search($listener, $read);
                    unset($read[$key]);
                    unset($key);
                    connect($newsock);
                    
                    
                }
            }

            foreach($read as $socket){

                // If connection isnt authed yet,
                // send confirmation handshake to browserpack('N', $key1).pack('N', $key2)
                if(!in_array($socket, $authed)) {

                    // Parse browsers handshake
                    $data = stream_get_line($socket, 9999, "\r\n\r\n");
                    $data .= "\r\n\r\n".fgets($socket);

                    if(preg_match('#GET (.*?) HTTP#', $data, $match)) {
                        $resource = $match[1];
                    }
                    if(preg_match("#Host: (.*?)\r\n#", $data, $match)) {
                        $host = $match[1];
                    }
                    if(preg_match("#Sec-WebSocket-Key1: (.*?)\r\n#", $data, $match)) {
                        $key = $match[1];
                    }
                    if(preg_match("#Sec-WebSocket-Protocol: (.*?)\r\n#", $data, $match)) {
                        $protocol = $match[1];
                    }
                   if(preg_match("#Sec-WebSocket-Key2: (.*?)\r\n#", $data, $match)) {
                        $spaces = 0;
                        str_replace(' ', '', $match[1], $spaces);
                        $key2 = (preg_replace('#[^0-9]+#', '', $match[1])/$spaces);
                    }
                    
                    if(preg_match("#Origin: (.*?)\r\n#", $data, $match)) {
                        $origin = $match[1];
                    }
                    if(preg_match("#\r\n\r\n(.*?)\$#", $data, $match)) {
                        $code = $match[1];
                    }
                    
                    $answer =     "HTTP/1.1 101 WebSocket Protocol Handshake\r\n".
                                "Upgrade: WebSocket\r\n".
                                "Connection: Upgrade\r\n".
                                "Sec-WebSocket-Origin: ".$origin."\r\n".
                                "Sec-WebSocket-Location: ws://".$host."".$resource."\r\n".
                                ($protocol ? "Sec-WebSocket-Protocol: ".$protocol."\r\n" : "").
                                "\r\n".md5(pack('N', $key1).pack('N', $key2).$code,true);
		/*			
					$string = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
					$answer =   "HTTP/1.1 101 Web Socket Protocol Handshake\r\n".
                                "Upgrade: websocket\r\n".
                                "Connection: Upgrade\r\n".
                                "Sec-WebSocket-Accept: ".base64_encode(sha1($key.$string,true))."\r\n"."\r\n";
		*/			
                    $authed[] = $socket;

                    fwrite($socket, $answer, strlen($answer));

                    echo 'Sent confirmation handshake'."\r\n";

                    continue;

                }else{
                    // Get already authed connections data
                    $data = trim(@fgets($socket), " \r\n".chr(0).chr(255));
                }

                if(mb_strlen($data) == 0) {
                    continue;
                }

                echo 'Received data:'.utf8_encode($data)."\r\n";

				
				$mask = substr($data,2,6);
				$byte = array();
				foreach (str_split($data) as $chr) {
    				$byte[] = sprintf("%02X", ord($chr));
				}
				for($i = 0;$i<strlen($data);$i++)
				{
					$byte[$i] = $byte[$i] ^ $mask[$i % 4];
				}
				$data = $byte;
                $nfo = stream_get_meta_data($socket);

                if(!$nfo["timed_out"] && !$nfo["eof"]) {

                    // Put whatever you want your software to do here
                    // Note that when sending a msg back you have to
                    // Wrap the message with chr(0) and chr(255)
                    // Example:
                    // fwrite($socket, chr(0).'test'.chr(255));
                    $user = getuserbysocket($socket);
                    if($user != NULL)
                        enviaTodos($user,$data);
                }else{
					
					// Envia comando para destruir objeto no browser
					
                    @fclose($socket);
                    
                    $key = array_search($socket, $clients);
                    unset($clients[$key]);
                    echo "Client timed out\n";
                    $user = getuserbysocket($socket);
                    disconnect($socket);
                    @fclose($user->socket);
                    $key = array_search($user, $users);
                    unset($users[$key]);

                }
            }

        }

        foreach($clients as $client) {

            $nfo = stream_get_meta_data($client);

            if($nfo["timed_out"] || $nfo["eof"]) {

				// Envia comando para destruir objeto no browser
                @fclose($socket);
				$user = getuserbysocket($socket);
                disconnect($socket);
                @fclose($user->socket);
                $key = array_search($user, $users);
                unset($users[$key]);
                $key = array_search($socket, $clients);
                unset($clients[$key]);
                echo "Client timed out\n";
                disconnect($socket);

            }
        }

    }

}
function enviaTodos($user,$msg){
  global $users;
  
  $action = $msg;
  //$action = str_replace("\uFFFD","\\",$action);
  say("< ".utf8_decode($action[0]));
  if($msg != "novo")
	  foreach($users as $all)
	  {
		  if($all->id != $user->id)
			  send($all->socket,$msg);
	  }
  if($user->novo)
  {
	say("NumUser".count($users));
	if(count($users)>1)
		send($user->socket,"jogador2");
    $user->novo = false;
		
  }

}



function connect($socket){
  global $users,$clients;
  $user = new User();
  $user->id = uniqid();
  $user->socket = $socket;
  $user->novo = true;
  array_push($users,$user);
  //array_push($clients,$socket);
  say($socket." CONNECTED!");
}

function getuserbysocket($socket){
  global $users;
  $found=null;
  foreach($users as $user){
    if($user->socket==$socket){ $found=$user; break; }
  }
  return $found;
}
class User{
  var $id;
  var $socket;
  var $novo;
  var $nome;
}
function send($client,$msg){
  say("> ".$msg);
  $msg = wrap($msg);
  fwrite($client,$msg,strlen($msg));
}
function disconnect($socket){
  global $users;
 $usersfound = null;
  $found=null;
  $n = count($users);
  for($i=0;$i<$n;$i++){
     if($users[$i]->socket==$socket){$usersfound=$i; break; }
  }
  if(!is_null($found)){ array_splice($users,$found,1); }
  say($socket." DISCONNECTED!");
  if($usersfound!=NULL)
      unset($users[$usersfound]);
}
function  say($msg=""){ echo $msg."\n"; }
function  wrap($msg=""){ return chr(0).$msg.chr(255); }
function  unwrap($msg=""){ return substr($msg,1,strlen($msg)-2); }
?>
