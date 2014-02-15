<?php
/*
  Enum-like construct containing all opcodes defined in the WebSocket protocol
 
  @author Chris
 
 */
 class WebSocketMessageNotFinalised extends Exception{
        public function __construct(IWebSocketMessage $msg){
                parent::__construct("WebSocketMessage is not finalised!");
        }
}

class WebSocketFrameSizeMismatch extends Exception{
        public function __construct(IWebSocketFrame $msg){
                parent::__construct("Frame size mismatches with the expected frame size. Maybe a buggy client.");
        }
}

class WebSocketInvalidChallengeResponse extends Exception{
        public function __construct(){
                parent::__construct("Server send an incorrect response to the clients challenge!");
        }
}

class WebSocketInvalidUrlScheme extends Exception{
        public function __construct(){
                parent::__construct("Only 'ws://' urls are supported!");
        }
}
class WebSocketOpcode{
	const __default = 0;
	
	const ContinuationFrame = 0x00;
	const TextFrame = 0x01;
	const BinaryFrame = 0x02;
	
	const CloseFrame = 0x08;
	
	const PingFrame = 0x09;
	const PongFrame = 0x09;
	
	private function __construct(){
		
	}

	/**
	 * Check if a opcode is a control frame. Control frames should be handled internally by the server.
	 * @param int $type
	 */
	public static function isControlFrame($type){
		$controlframes = array(self::CloseFrame, self::PingFrame, self::PongFrame);
		
		return array_search($type, $controlframes) !== false;
	}
}


/**
 * Interface for WebSocket frames. One or more frames compose a message.
 * In the case of the Hixie protocol, a message contains of one frame only
 *
 * @author Chris
 */
interface IWebSocketFrame{
	/**
	 * Serialize the frame so that it can be send over a socket
	 * @return string Serialized binary string
	 */
	public function encode();
	
	/**
	 * Deserialize a binary string into a IWebSocketFrame
	 * @return string Serialized binary string
	 */
	public static function decode($string);
	
	/**
	 * @return string Payload Data inside the frame
	 */
	public function getData();
	
	/**
	 * @return int The frame type (opcode)
	 */
	public function getType();
	
	/**
	 * Create a frame by type and payload data
	 * @param int $type
	 * @param string $data
	 * 
	 * @return IWebSocketFrame
	 */
	public static function create($type, $data = null);
}

/**
 * HYBIE WebSocketFrame
 *
 * @author Chris
 *
 */
class WebSocketFrame implements IWebSocketFrame{
	// First Byte
	protected $FIN = 0;
	protected $RSV1 = 0;
	protected $RSV2 = 0;
	protected $RSV3 = 1;
	protected $opcode = WebSocketOpcode::TextFrame;
	
	// Second Byte
	protected $mask = 0;
	protected $payloadLength = 0;
	protected $maskingKey = 0;
	
	protected $payloadData = 0;
	
	function __construct(){	}
	
	public static function create($type, $data = null){
		$o = new self();
		
		$o->FIN = true;
		$o->payloadData = $data;
		$o->payloadLength = $data != null ? strlen($data) : 0;
		$o->setType($type);
		
		
		return $o;
	}
	
	public function isMasked(){
		return $this->mask == 1;
	}
	
	protected function setType($type){
		$this->opcode = $type;
		
		if($type == WebSocketOpcode::CloseFrame)
			$this->mask = 1;
	}
	
	protected static function IsBitSet($byte, $pos)
	{
		return ($byte & pow(2,$pos)) > 0 ? 1 : 0;
	}
	
	protected static function rotMask($data, $key){
		$res = '';
		for($i = 0; $i < strlen($data); $i++){
			$j = $i % 4;
			
			$res .= chr(ord($data[$i]) ^ ord($key[$j])); 
		}
		
		return $res;
	}
	
	public function getType(){
		return $this->opcode;
	}
	
	public function encode(){
		$this->payloadLength = strlen($this->payloadData);
		
		
		$firstByte = $this->opcode;
		$firstByte = 0x81;
		/*$firstByte += 
			$this->FIN * 128
			+ $this->RSV1 * 64
			+ $this->RSV2 * 32
			+ $this->RSV3 * 16;
		*/
		
		$encoded = chr($firstByte);
		
		if($this->payloadLength <= 125){
			$secondByte = $this->payloadLength;
			$secondByte += $this->mask * 128;

			$encoded .= chr($secondByte);
		} else if($this->payloadLength <= 255*255 - 1){
			$secondByte = 126;
			$secondByte += $this->mask * 128;
			
			$encoded .= chr($secondByte).pack("n", $this->payloadLength);
		} else {
			// TODO: max length is now 32 bits instead of 64 !!!!!
			$secondByte = 127;
			$secondByte += $this->mask * 128;
			
			$encoded .= chr($secondByte);
			$encoded .= pack("N",0);
			$encoded .= pack("N",$this->payloadLength);
		}
		
		$key = 0;
		if($this->mask){
			$key = pack("N", rand(0, pow(255,4) - 1));
			$encoded .= $key;
			
		}
		
		if($this->payloadData)
			 $encoded .= ($this->mask == 1) ? $this->rotMask($this->payloadData,$key) : $this->payloadData;
		
		return $encoded;
	}
	
	public static function decode($raw){
		$frame = new self();
	
		// Read the first two byte0x08s, then chop them off
		list($firstByte, $secondByte) = substr($raw,0,2);	
		$raw = substr($raw,2);
			
		$firstByte = ord($firstByte);
		$secondByte = ord($secondByte);
		
		$frame->FIN = self::IsBitSet($firstByte, 7);
		$frame->RSV1 = self::IsBitSet($firstByte, 6);
		$frame->RSV2 = self::IsBitSet($firstByte, 5);
		$frame->RSV3 = self::IsBitSet($firstByte, 4);
		
		$frame->mask = self::IsBitSet($secondByte, 7);
		
		$frame->opcode = ($firstByte & 0xFF);
		
		$len = $secondByte & 0x7F;
		
		
		if($len < 125)
			$frame->payloadLength = $len;
		elseif($len == 126){
			list($frame->payloadLength) = unpack("nfirst", $raw);
			$raw = substr($raw,2);
		} elseif($len == 127) {
			list($frame->payloadLength) = unpack("nfirst", $raw);
			$raw = substr($raw,8);
		}
			
		if($frame->mask){
			$frame->maskingKey = substr($raw,0,4);
			$raw = substr($raw,4);
		}
		
		if(strlen($raw) != $frame->payloadLength){
			echo "Erro no tamanho do frame!!\n";
			return false;
		}
			
		if($frame->mask)
			$frame->payloadData = self::rotMask($raw, $frame->maskingKey);
		else $frame->payloadData = $raw;
		
		return $frame->payloadData;
	}
	
	public function isFinal(){
		return $this->FIN == 1;
	}
	
	public function getData(){
		return $this->payloadData;
	}
}

class WebSocketFrame76 implements IWebSocketFrame{
	public $payloadData = '';
	protected $opcode = WebSocketOpcode::TextFrame;
	
	public static function create($type, $data = null){
		$o = new self();
		
		$o->payloadData = $data;
		
		return $o;
	}
	
	public function encode(){
		return chr(0).$this->payloadData.chr(255);
	}
	
	public function getData(){
		return $this->payloadData;
	}
	
	public function getType(){
		return $this->opcode;
	}
	
	public static function decode($str){
		$o = new self();
		$o->payloadData = substr($str, 1, strlen($str) - 2);
		
		return $o;
	}
	
}
$errno = 0;
$errstr = "";

$s = stream_socket_server("tcp://127.0.0.1:33333", $errno, $errstr, STREAM_SERVER_BIND|STREAM_SERVER_LISTEN);

if($s == false) {
    echo "FAILED ".$errno." ".$errstr."\r\n";
}else{

    $clients = array();
    $authed = array();
    $listeners = array();
    $listeners[] = $s;
    $users = array();

    while(true) {
        usleep(0);

        $read = array_merge(array_values($clients), array_values($listeners));

        if(stream_select($read, $write = NULL, $except = NULL, 0) > 0) {

            foreach($listeners as $listener) {

                // Check if its a new socket or not
                if(in_array($listener, $read) && !in_array($read, $clients)) {

                    // Accept new client
                    $clients[]= $newsock = @stream_socket_accept($listener);
                    stream_set_timeout($newsock, 15);
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
                    if(preg_match("#Sec-WebSocket-Key: (.*?)\r\n#", $data, $match)) {
                        $key = $match[1];
                    }
                    if(preg_match("#Sec-WebSocket-Protocol: (.*?)\r\n#", $data, $match)) {
                        $protocol = $match[1];
                    }
                   /*if(preg_match("#Sec-WebSocket-Key2: (.*?)\r\n#", $data, $match)) {
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
				*/
					echo $data;
					$string = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
					$answer =   "HTTP/1.1 101 Web Socket Protocol Handshake\r\n".
                                "Upgrade: websocket\r\n".
                                "Connection: Upgrade\r\n".
                                "Sec-WebSocket-Accept: ".base64_encode(sha1($key.$string,true))."\r\n"."\r\n";
				
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

				
				$data = WebSocketFrame::decode($data);
				
				
                
                $nfo = stream_get_meta_data($socket);

                if(!$nfo["timed_out"] && !$nfo["eof"]) {

                    // Put whatever you want your software to do here
                    // Note that when sending a msg back you have to
                    // Wrap the message with chr(0) and chr(255)
                    // Example:
                    // fwrit$webCrip->encode(0,$msg);e($socket, chr(0).'test'.chr(255));
                    $user = getuserbysocket($socket);
                    if($user != NULL){
                        if(verificaMSG($data)){
                        	enviaTodos($user,$data);
                        }else
                        {
                        	$data = "REE";
                        	$webCrip = new WebSocketFrame();
							$webCrip = $webCrip->create(1,$data);
							$data = $webCrip->encode();
							send($user->socket,$data);
                        }
                        	
                    }
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
  
  echo "< ".$msg."\n";
  $webCrip = new WebSocketFrame();
  $webCrip = $webCrip->create(1,$msg);
  $action = $webCrip->encode();
  //$action = str_replace("\uFFFD","\\",$action);

  if($msg != "novo")
	  foreach($users as $all)
	  {
		  if($all->id != $user->id)
			  send($all->socket,$action);
	  }
  if($user->novo)
  {
  	$webCrip = $webCrip->create(1,"jogador2");
	say("NumUser".count($users));
	if(count($users)>1)
		send($user->socket,$webCrip->encode());
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
  //$msg = wrap($msg);
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
function verificaMSG($msg)
{
	$msg = substr($msg,0,1);
	switch($msg)
	{
		case 'R':
		case 'M':
		case 'C':
		case 'n':
		case 'j':
		case 'I':
		case 'G': return true;break;
		default: return false;
	}
}
function  say($msg=""){ echo $msg."\n"; }
function  wrap($msg=""){ return chr(0).$msg.chr(255); }
function  unwrap($msg=""){ return substr($msg,1,strlen($msg)-2); }

?>
