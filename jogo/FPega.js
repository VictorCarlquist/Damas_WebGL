var hoverobj;
var mouseovercanvas;
var pecaPega;
var ThreadViraTabu;

function Pega(mouse)
{
	var obj;
	var mousepos=mouse.getMousePosition();
	if(mouseovercanvas){
		mousepos.x=mousepos.x-document.getElementById("container").offsetLeft;
		mousepos.y=mousepos.y-document.getElementById("container").offsetTop;
		if(mousepos.x && mousepos.y){
			obj=jogoCena.pick(mousepos.x,mousepos.y).object;
				if(obj && obj!=hoverobj){
						obj.oldmaterial=obj.getMaterial();
						obj.setMaterial(doc.getElement("verde"));
						VerificaPeca(obj);
								
				}
			if(hoverobj) hoverobj.setMaterial(hoverobj.oldmaterial);		
			hoverobj=obj;
			document.getElementById("debug2").innerHTML = "P: "+numPecaP+" B: "+numPecaB; 
		}
	}
}

function VerificaPeca(obj)
{
	var dir;
	var posP;
	var posQ;

	if(play1 && !jogador2)
	{
		if(!pecaPega && obj.id[0] == "P" && !seguido)//Primeiro pega a peça
			pecaPega = obj;
		else
			if(pecaPega && obj.id[0] == "Q" )//Segundo Pega o futuro local
			{
			
					
				posQ = PegaQuadTabuleiro(obj);
				posP = PegaPecaTabuleiro(pecaPega);
				if(posQ.co > posP.co)
					dir = "D";
				else
					dir = "E";
				if(posQ.li == posP.li-2 && pecaPega.id[2] != "R")
					dir += "D";
				
				if(pecaPega.id[2] == "R")	
				{
					
					if(posQ.li > posP.li)
						dir += "B"
					else
						dir += "C"
				}
				if(VerificaMovimento(pecaPega,dir,obj)){
					VerificaDama(pecaPega);
					pecaPega.blendTo({LocX:obj.getLocX()+1,LocY:obj.getLocY()-3},1000);
					if(comeu)
						seguido = comeSeguido(PegaPecaTabuleiro(pecaPega));
					if(!seguido)
					{
						if(!online)
						{
							gira = true;
							ThreadViraTabu = window.setInterval(ViraTabuleiroD,5);
						}
						play1 = (play1) ? false : true;
						mudaAvisaVez();
					}
					
				}
				if(!seguido)
					pecaPega = null;
			}
			else
				if(obj.id[0] == "P"  && !seguido)
					pecaPega = obj;
	}else if(!online || jogador2){
		if(!pecaPega && obj.id[0] == "B" && !seguido)//Primeiro pega a peça
				pecaPega = obj;
		else	
			if(pecaPega && obj.id[0] == "Q" )//Segundo Pega o futuro local
			{
				
				posQ = PegaQuadTabuleiro(obj);
				posP = PegaPecaTabuleiro(pecaPega);
				if(posQ.co < posP.co)
					dir = "D";
				else
					dir = "E";
				if(posQ.li == posP.li+2 && pecaPega.id[2] != "R")
					dir += "D";
				
				if(pecaPega.id[2] == "R")
				{
					
					if(posQ.li < posP.li)
						dir += "B"
					else
						dir += "C"
				}
				if(VerificaMovimento(pecaPega,dir,obj)){
					VerificaDama(pecaPega);
					pecaPega.blendTo({LocX:obj.getLocX()+1,LocY:obj.getLocY()-3},1000);
					if(comeu)
						seguido = comeSeguido(PegaPecaTabuleiro(pecaPega));
					if(!seguido)
					{
						if(!online)
						{
							gira = true;
							ThreadViraTabu = window.setInterval(ViraTabuleiroE,5);
						}
						play1 = (play1) ? false : true;
						mudaAvisaVez();
					}
					
				}
				if(!seguido)
					pecaPega = null;

			}else
				if(obj.id[0] == "P" && !seguido)
					pecaPega = obj;
	}
	
}
function ViraTabuleiroD()
{
	camx+=0.2;
	//document.getElementById("debug").innerHTML = camx;
	if(camx >= 31)
	{
		window.clearInterval(ThreadViraTabu);
		ThreadViraTabu = null;
		gira = false;
	}
}
function ViraTabuleiroE()
{
	camx-=0.2;
	//document.getElementById("debug").innerHTML = camx;
	if(camx <= 0)
	{
		window.clearInterval(ThreadViraTabu);
		ThreadViraTabu = null;
		gira = false;
	}
}
function VerificaMovimento(obj,Dir,Quad)
{
	var posP = PegaPecaTabuleiro(obj);
	var posQ = PegaQuadTabuleiro(Quad);
	//document.getElementById("estado").innerHTML = " :liP " + posP.li + " coP " + posP.co + " :liQ " + posQ.li + " coQ " + posQ.co + " Dir: " + Dir;  
	if(!posP || posP.li == posQ.li || posP.co == posQ.co || !pecaPega || !posQ || !obj){
		return false;
	}
	if(play1 && obj.id[2] != "R")
	{
		if(posP.li < posQ.li && !seguido)
			return false;
		
	}else if(obj.id[2] != "R")
		if(posP.li > posQ.li && !seguido)
			return false;
			
	if(obj.id[2] != "R"){
		if((play1 || online) && posP.li != 0 && obj.id[0] == "P")
		{
			if(((posP.li-posQ.li) > 2 || (posP.co-posQ.co) > 2) && !seguido){
				return false;
			}
			if(tabuleiro[(posP.li-1)][(posP.co-1)] == 0 && Dir == "E" && (posQ.co+1) == posP.co){
				tabuleiro[posP.li-1][posP.co-1] = obj;
				tabuleiro[posP.li][posP.co] = 0;	
				tcpEnvia("M$"+(posP.li)+"$"+(posP.co)+"$"+(posP.li-1)+"$"+(posP.co-1)+"$"+(Quad.getLocX()+1)+"$"+(Quad.getLocY()-3));
				return true;
			}
			if(tabuleiro[(posP.li-1)][(posP.co+1)] == 0 && Dir == "D" && (posQ.co-1) == posP.co){
				tabuleiro[posP.li-1][posP.co+1] = obj;
				tabuleiro[posP.li][posP.co] = 0;	
				tcpEnvia("M$"+(posP.li)+"$"+(posP.co)+"$"+(posP.li-1)+"$"+(posP.co+1)+"$"+(Quad.getLocX()+1)+"$"+(Quad.getLocY()-3));
				return true;
			}
			if((posP.li-2) >= 0 && (posP.co-2) >= 0 && Dir == "ED" && tabuleiro[posP.li-1][posP.co-1] !=0 )
				if(tabuleiro[posP.li-2][posP.co-2] == 0){
					tabuleiro[posP.li-2][posP.co-2] = obj;
					tabuleiro[posP.li][posP.co] = 0;
					tabuleiro[posP.li-1][posP.co-1].blendTo({LocX:-18,LocY:0},1000);
					tabuleiro[posP.li-1][posP.co-1] = 0;			
					numPecaB--;
					comeu = true;
					tcpEnvia("C$"+(posP.li)+"$"+(posP.co)+"$"+(posP.li-2)+"$"+(posP.co-2)+"$"+(Quad.getLocX()+1)+"$"+(Quad.getLocY()-3)+"$"+(posP.li-1)+"$"+(posP.co-1));
					return true;
				}
			if((posP.li-2) >= 0 && (posP.co+2) < 8 && Dir == "DD" && tabuleiro[posP.li-1][posP.co+1] !=0)
				if(tabuleiro[posP.li-2][posP.co+2] == 0){
					tabuleiro[posP.li-2][posP.co+2] = obj;
					tabuleiro[posP.li][posP.co] = 0;
					tabuleiro[posP.li-1][posP.co+1].blendTo({LocX:-18,LocY:0},1000);
					tabuleiro[posP.li-1][posP.co+1] = 0;			
					numPecaB--;
					comeu = true;
					tcpEnvia("C$"+(posP.li)+"$"+(posP.co)+"$"+(posP.li-2)+"$"+(posP.co+2)+"$"+(Quad.getLocX()+1)+"$"+(Quad.getLocY()-3)+"$"+(posP.li-1)+"$"+(posP.co+1));
					return true;
				}
			if(seguido) // Come varias as peças
			{
				if((posP.li+2) < 8 && (posP.co-2) >= 0 && Dir == "E" && tabuleiro[posP.li+1][posP.co-1] !=0)
				if(tabuleiro[posP.li+2][posP.co-2] == 0){
					tabuleiro[posP.li+2][posP.co-2] = obj;
					tabuleiro[posP.li][posP.co] = 0;
					tabuleiro[posP.li+1][posP.co-1].blendTo({LocX:20,LocY:0},1000);
					tabuleiro[posP.li+1][posP.co-1] = 0;			
					numPecaB--;
					comeu = true;
					seguido = false;
					tcpEnvia("CS$"+(posP.li)+"$"+(posP.co)+"$"+(posP.li+2)+"$"+(posP.co-2)+"$"+(Quad.getLocX()+1)+"$"+(Quad.getLocY()-3)+"$"+(posP.li+1)+"$"+(posP.co-1));
					return true;
				}
				if((posP.li+2) < 8 && (posP.co+2) < 8 && Dir == "D" && tabuleiro[posP.li+1][posP.co+1] !=0)
					if(tabuleiro[(posP.li+2)][(posP.co+2)] == 0){
						tabuleiro[posP.li+2][posP.co+2] = obj;
						tabuleiro[posP.li][posP.co] = 0;
						tabuleiro[posP.li+1][posP.co+1].blendTo({LocX:20,LocY:0},1000);
						tabuleiro[posP.li+1][posP.co+1] = 0;			
						numPecaB--;
						comeu = true;
						seguido = false;
						tcpEnvia("CS$"+(posP.li)+"$"+(posP.co)+"$"+(posP.li+2)+"$"+(posP.co+2)+"$"+(Quad.getLocX()+1)+"$"+(Quad.getLocY()-3)+"$"+(posP.li+1)+"$"+(posP.co+1));
						return true;
					}
			
			}
		
	
		}else if((!play1 || online) && posP.li != 7 && obj.id[0] == "B")
		{
			if(((posP.li-posQ.li) > 2 || (posP.co-posQ.co) > 2) && !seguido){
				return false;
			}
			if(tabuleiro[(posP.li+1)][(posP.co-1)] == 0 && Dir == "D" && (posQ.co+1) == posP.co){
				tabuleiro[posP.li+1][posP.co-1] = obj;
				tabuleiro[posP.li][posP.co] = 0;	
				tcpEnvia("M$"+(posP.li)+"$"+(posP.co)+"$"+(posP.li+1)+"$"+(posP.co-1)+"$"+(Quad.getLocX()+1)+"$"+(Quad.getLocY()-3));
				return true;
			}
			if(tabuleiro[(posP.li+1)][(posP.co+1)] == 0 && Dir == "E" && (posQ.co-1) == posP.co){
				tabuleiro[posP.li+1][posP.co+1] = obj;
				tabuleiro[posP.li][posP.co] = 0;	
				tcpEnvia("M$"+ posP.li+"$"+posP.co+"$"+(posP.li+1)+"$"+(posP.co+1)+"$"+(Quad.getLocX()+1)+"$"+(Quad.getLocY()-3));
				return true;
			}
			if((posP.li+2) < 8 && (posP.co-2) >= 0 && Dir == "DD" && tabuleiro[posP.li+1][posP.co-1] != 0)
				if(tabuleiro[posP.li+2][posP.co-2] == 0){
					tabuleiro[posP.li+2][posP.co-2] = obj;
					tabuleiro[posP.li][posP.co] = 0;
					tabuleiro[posP.li+1][posP.co-1].blendTo({LocX:20,LocY:0},1000);
					tabuleiro[posP.li+1][posP.co-1] = 0;			
					numPecaP--;
					comeu = true;
					seguido = false;
					tcpEnvia("C$"+(posP.li)+"$"+(posP.co)+"$"+(posP.li+2)+"$"+(posP.co-2)+"$"+(Quad.getLocX()+1)+"$"+(Quad.getLocY()-3)+"$"+(posP.li+1)+"$"+(posP.co-1));
					return true;
				}
			if((posP.li+2) < 8 && (posP.co+2) < 8 && Dir == "ED" && tabuleiro[posP.li+1][posP.co+1] !=0)
				if(tabuleiro[(posP.li+2)][(posP.co+2)] == 0){
					tabuleiro[posP.li+2][posP.co+2] = obj;
					tabuleiro[posP.li][posP.co] = 0;
					tabuleiro[posP.li+1][posP.co+1].blendTo({LocX:20,LocY:0},1000);
					tabuleiro[posP.li+1][posP.co+1] = 0;			
					numPecaP--;
					comeu = true;
					seguido = false;
					tcpEnvia("C$"+(posP.li)+"$"+(posP.co)+"$"+(posP.li+2)+"$"+(posP.co+2)+"$"+(Quad.getLocX()+1)+"$"+(Quad.getLocY()-3)+"$"+(posP.li+1)+"$"+(posP.co+1));
					return true;
				}
			if(seguido)	// Come varias as peças
			{
				if((posP.li-2) >= 0 && (posP.co-2) >= 0 && Dir == "D" && tabuleiro[posP.li-1][posP.co-1] !=0)
				if(tabuleiro[posP.li-2][posP.co-2] == 0){
					tabuleiro[posP.li-2][posP.co-2] = obj;
					tabuleiro[posP.li][posP.co] = 0;
					tabuleiro[posP.li-1][posP.co-1].blendTo({LocX:-18,LocY:0},1000);
					tabuleiro[posP.li-1][posP.co-1] = 0;			
					numPecaP--;
					comeu = true;
					tcpEnvia("CS$"+(posP.li)+"$"+(posP.co)+"$"+(posP.li-2)+"$"+(posP.co-2)+"$"+(Quad.getLocX()+1)+"$"+(Quad.getLocY()-3)+"$"+(posP.li-1)+"$"+(posP.co-1));
					return true;
				}
				if((posP.li-2) >= 0 && (posP.co+2) < 8 && Dir == "E" && tabuleiro[posP.li-1][posP.co+1] !=0)
					if(tabuleiro[posP.li-2][posP.co+2] == 0){
						tabuleiro[posP.li-2][posP.co+2] = obj;
						tabuleiro[posP.li][posP.co] = 0;
						tabuleiro[posP.li-1][posP.co+1].blendTo({LocX:-18,LocY:0},1000);
						tabuleiro[posP.li-1][posP.co+1] = 0;			
						numPecaP--;
						comeu = true;
						tcpEnvia("CS$"+(posP.li)+"$"+(posP.co)+"$"+(posP.li-2)+"$"+(posP.co+2)+"$"+(Quad.getLocX()+1)+"$"+(Quad.getLocY()-3)+"$"+(posP.li-1)+"$"+(posP.co+1));
						return true;
					}
			}
		}
	}else{
	
		return VerificaMovimentoDamaB(obj,posP,Dir,Quad);
	}
	return false;
}

function PegaPecaTabuleiro(obj)
{
	for(var i = 0;i<8;i++)
		for(var j = 0;j<8;j++){
				if(obj.id == tabuleiro[i][j].id)
				{
					return {li:i,co:j};
				}
		}
	return null;
}
function PegaQuadTabuleiro(obj)
{
	
	for(var i = 0;i<8;i++)
		for(var j = 0;j<8;j++){		
				if(obj.id == tabuleiroQuad[i][j].id)
				{				
					return {li:i,co:j};
				}
		}
	return null;
}
function MovePecaOnline(pos)
{
	var obj;
	pos = pos.split("$");
	obj = tabuleiro[pos[1]][pos[2]];
	tabuleiro[pos[1]][pos[2]] = 0;
	tabuleiro[pos[3]][pos[4]] = obj;
	tabuleiro[pos[3]][pos[4]].blendTo({LocX:(pos[5]),LocY:(pos[6])},1000);
	if(pos[0] == "C" || pos[0] == "CS")
	{
		tabuleiro[pos[7]][pos[8]].blendTo({LocX:-18,LocY:0},1000);
		tabuleiro[pos[7]][pos[8]] = 0;
		if(jogador2)
			numPecaB--;
		else
			numPecaP--;
	}
	VerificaDama(tabuleiro[pos[3]][pos[4]]);
	
	
}
function VerificaDama(peca)
{
	var obj = PegaPecaTabuleiro(peca);
	var novoId;
	if(peca.id[2]!="R"){
		if(peca.id[0] == "P" && obj.li == 0){
			peca.setScaleX(1.5);
			peca.setScaleY(1.5);
			peca.setScaleZ(6);	
			peca.setLocZ(8.5);
			novoId =  peca.id.substring(0,2) + "R" +peca.id.substring(3);
			peca.setId(novoId);
			/*if(online)
			{
				mudaAvisaVez();
				tcpEnvia("R$"+ obj.li+"$"+obj.co);
			}*/
		}
		if(peca.id[0] == "B" && obj.li == 7){
			peca.setScaleX(1.5);
			peca.setScaleY(1.5);
			peca.setScaleZ(6);	
			peca.setLocZ(8.5);
			novoId =  peca.id.substring(0,2) + "R" +peca.id.substring(3);
			peca.setId(novoId);
			/*if(online)
			{
				mudaAvisaVez();
				tcpEnvia("R$"+ obj.li+"$"+obj.co);
			}*/
		}		
	}
}

function VerificaMovimentoDama(obj,posP,Dir,Quad)
{		
	var TipoPodeComer;
	 
	if(play1)
		TipoPodeComer = "B";
	else
	{
		TipoPodeComer = "P";
		if(Dir == "DC")
			Dir = "EB";
		else if(Dir == "EB")
			Dir = "DC";
		if(Dir == "DB")
			Dir = "EC";

		else if(Dir == "EC")
			Dir = "DB";
	}
	//document.getElementById("estado").innerHTML = " :liP " + posP.li + " coP " + posP.co +" Dir: " + Dir; 
	if(posP.li != 0)
	{
		if(tabuleiro[posP.li-1][posP.co-1] == 0 && Dir == "EC"){
			tabuleiro[posP.li-1][posP.co-1] = obj;
			tabuleiro[posP.li][posP.co] = 0;	
			tcpEnvia("M$"+ posP.li+"$"+posP.co+"$"+(posP.li-1)+"$"+(posP.co-1)+"$"+(Quad.getLocX()+1)+"$"+(Quad.getLocY()-3));
			return true;
		}
		if(tabuleiro[posP.li-1][posP.co+1] == 0 && Dir == "DC"){
			tabuleiro[posP.li-1][posP.co+1] = obj;
			tabuleiro[posP.li][posP.co] = 0;	
			tcpEnvia("M$"+ posP.li+"$"+posP.co+"$"+(posP.li-1)+"$"+(posP.co+1)+"$"+(Quad.getLocX()+1)+"$"+(Quad.getLocY()-3));
			return true;
		}
		if((posP.li-2) >= 0 && (posP.co-2) >= 0 && Dir == "EC")
			if(tabuleiro[posP.li-2][posP.co-2] == 0 && tabuleiro[posP.li-1][posP.co-1].id[0] == TipoPodeComer){
				tabuleiro[posP.li-2][posP.co-2] = obj;
				tabuleiro[posP.li][posP.co] = 0;
				tabuleiro[posP.li-1][posP.co-1].blendTo({LocX:-18,LocY:0},1000);
				tabuleiro[posP.li-1][posP.co-1] = 0;			
				comeu = true;
				if(seguido)
					tcpEnvia("CS$"+ posP.li+"$"+posP.co+"$"+(posP.li-2)+"$"+(posP.co-2)+"$"+(Quad.getLocX()+1)+"$"+(Quad.getLocY()-3)+"$"+(posP.li-1)+"$"+(posP.co-1));
				else
					tcpEnvia("C$"+ posP.li+"$"+posP.co+"$"+(posP.li-2)+"$"+(posP.co-2)+"$"+(Quad.getLocX()+1)+"$"+(Quad.getLocY()-3)+"$"+(posP.li-1)+"$"+(posP.co-1));
				return true;
			}
		if((posP.li-2) >= 0 && (posP.co+2) < 8 && Dir == "DC")
			if(tabuleiro[posP.li-2][posP.co+2] == 0 && tabuleiro[posP.li-1][posP.co+1].id[0] == TipoPodeComer){
				tabuleiro[posP.li-2][posP.co+2] = obj;
				tabuleiro[posP.li][posP.co] = 0;
				tabuleiro[posP.li-1][posP.co+1].blendTo({LocX:-18,LocY:0},1000);
				tabuleiro[posP.li-1][posP.co+1] = 0;			
				comeu = true;
				if(seguido)
					tcpEnvia("CS$"+ posP.li+"$"+posP.co+"$"+(posP.li-2)+"$"+(posP.co+2)+"$"+(Quad.getLocX()+1)+"$"+(Quad.getLocY()-3)+"$"+(posP.li-1)+"$"+(posP.co+1));
				else
					tcpEnvia("C$"+ posP.li+"$"+posP.co+"$"+(posP.li-2)+"$"+(posP.co+2)+"$"+(Quad.getLocX()+1)+"$"+(Quad.getLocY()-3)+"$"+(posP.li-1)+"$"+(posP.co+1));
				return true;
			}
	}
	if(posP.li!= 8){
		if(tabuleiro[posP.li+1][posP.co-1] == 0 && Dir == "EB"){
			tabuleiro[posP.li+1][posP.co-1] = obj;
			tabuleiro[posP.li][posP.co] = 0;	
			tcpEnvia("M$"+ posP.li+"$"+posP.co+"$"+(posP.li+1)+"$"+(posP.co-1)+"$"+(Quad.getLocX()+1)+"$"+(Quad.getLocY()-3));
			return true;
		}
		if(tabuleiro[posP.li+1][posP.co+1] == 0 && Dir == "DB"){
			tabuleiro[posP.li+1][posP.co+1] = obj;
			tabuleiro[posP.li][posP.co] = 0;	
			tcpEnvia("M$"+ posP.li+"$"+posP.co+"$"+(posP.li+1)+"$"+(posP.co+1)+"$"+(Quad.getLocX()+1)+"$"+(Quad.getLocY()-3));
		
			return true;
		}
		if((posP.li+2) < 8 && (posP.co-2) >= 0 && Dir == "EB")
			if(tabuleiro[posP.li+2][posP.co-2] == 0 && tabuleiro[posP.li+1][posP.co-1].id[0] == TipoPodeComer){
				tabuleiro[posP.li+2][posP.co-2] = obj;
				tabuleiro[posP.li][posP.co] = 0;
				tabuleiro[posP.li+1][posP.co-1].blendTo({LocX:20,LocY:0},1000);
				tabuleiro[posP.li+1][posP.co-1] = 0;			
				if(seguido)
					tcpEnvia("CS$"+ posP.li+"$"+posP.co+"$"+(posP.li+2)+"$"+(posP.co-2)+"$"+(Quad.getLocX()+1)+"$"+(Quad.getLocY()-3)+"$"+(posP.li+1)+"$"+(posP.co-1));
				else
					tcpEnvia("C$"+ posP.li+"$"+posP.co+"$"+(posP.li+2)+"$"+(posP.co-2)+"$"+(Quad.getLocX()+1)+"$"+(Quad.getLocY()-3)+"$"+(posP.li+1)+"$"+(posP.co-1));
				comeu = true;
				return true;
			}
		if((posP.li+2) < 8 && (posP.co+2 < 8) && Dir == "DB")
			if(tabuleiro[posP.li+2][posP.co+2] == 0 && tabuleiro[posP.li+1][posP.co+1].id[0] == TipoPodeComer){
				tabuleiro[posP.li+2][posP.co+2] = obj;
				tabuleiro[posP.li][posP.co] = 0;
				tabuleiro[posP.li+1][posP.co+1].blendTo({LocX:20,LocY:0},1000);
				tabuleiro[posP.li+1][posP.co+1] = 0;			
				if(seguido)

					tcpEnvia("CS$"+ posP.li+"$"+posP.co+"$"+(posP.li+2)+"$"+(posP.co+2)+"$"+(Quad.getLocX()+1)+"$"+(Quad.getLocY()-3)+"$"+(posP.li+1)+"$"+(posP.co+1));
				else
					tcpEnvia("C$"+ posP.li+"$"+posP.co+"$"+(posP.li+2)+"$"+(posP.co+2)+"$"+(Quad.getLocX()+1)+"$"+(Quad.getLocY()-3)+"$"+(posP.li+1)+"$"+(posP.co+1));
				comeu = true;
				return true;
			}

		
	}
	return false;
} 

function mudaAvisaVez()
{
	if(play1 && !jogador2){
		document.getElementById("vez").innerHTML = "Jogador 1";
		document.getElementById("vez").style.color = "white";
		document.getElementById("vez").style.backgroundColor = "rgba(247,24,10,0.5)";
		
	}
	if(!play1 && !jogador2){
		document.getElementById("vez").innerHTML = "Jogador 2";
		document.getElementById("vez").style.color = "rgb(30,66,17)";
		document.getElementById("vez").style.backgroundColor = "rgba(255,255,255,0.5)";
	}
	if(play1 && jogador2){
		document.getElementById("vez").innerHTML = "Jogador 1";
		document.getElementById("vez").style.color = "white";
		document.getElementById("vez").style.backgroundColor = "rgba(247,24,10,0.5)";
	}
	if(!play1 && jogador2){
		document.getElementById("vez").innerHTML = "Jogador 2";
		document.getElementById("vez").style.color = "rgb(30,66,17)";
		document.getElementById("vez").style.backgroundColor = "rgba(255,255,255,0.5)";
	}
}

function VerificaMovimentoDamaB(obj,posP,Dir,Quad)
{		
	var posQ = PegaQuadTabuleiro(Quad);
	var ret =  LongaDiagonal(posP,posQ,Dir)
	if(ret)
	{
		tabuleiro[posQ.li][posQ.co] = tabuleiro[posP.li][posP.co];
		tabuleiro[posP.li][posP.co] = 0;
		if(ret !== true)
			if(seguido)
				tcpEnvia("CS$"+ posP.li+"$"+posP.co+"$"+(posQ.li)+"$"+(posQ.co)+"$"+(Quad.getLocX()+1)+"$"+(Quad.getLocY()-3)+ret);
			else
				tcpEnvia("C$"+ posP.li+"$"+posP.co+"$"+(posQ.li)+"$"+(posQ.co)+"$"+(Quad.getLocX()+1)+"$"+(Quad.getLocY()-3)+ret);
		else
			tcpEnvia("M$"+ posP.li+"$"+posP.co+"$"+(posQ.li)+"$"+(posQ.co)+"$"+(Quad.getLocX()+1)+"$"+(Quad.getLocY()-3));
		return true;
	}else
		return false;
	
} 

function LongaDiagonal(posP,posQ,Dir)

{
	var i = posQ.li;
	var j = posQ.co;
	var mesmaDiagonal = false;
	var Peca = 0;
	var str = "$";
	if(tabuleiro[i][j] != 0)
		return false;
	if(play1 && tabuleiro[posP.li][posP.co].id[0] != "P")
		return false;
	if(!play1 && tabuleiro[posP.li][posP.co].id[0] != "B")
		return false;
	if(play1){
		if(Dir == "DC") {i++;j--;}
		if(Dir == "DB")	{i--;j--;}
		if(Dir == "EC")	{i++;j++;}
		if(Dir == "EB")	{i--;j++;}
		if(tabuleiro[i][j] != 0)
			if(tabuleiro[i][j].id != tabuleiro[posP.li][posP.co].id)
				Peca = tabuleiro[i][j];
			else
				return true;
		do{
			if(Dir == "DC") {i++;j--;}
			if(Dir == "DB")	{i--;j--;}
			if(Dir == "EC")	{i++;j++;}
			if(Dir == "EB")	{i--;j++;}
			
			if(tabuleiro[i][j] != 0 && i != posP.li && j != posP.co)
				return false;
			if(tabuleiro[posP.li][posP.co].id == tabuleiro[i][j].id)
				mesmaDiagonal = true;
			//alert(i + " : " +j+" Dir: " + Dir);
		}while(tabuleiro[posP.li][posP.co].id != tabuleiro[i][j].id || i<0 || i>7 || j<0 || j>7);
		if(!mesmaDiagonal)
			return false;
		if(Peca != 0)
			if(Peca.id[0] == "B")
			{
				i = posQ.li;
				j = posQ.co;
				if(Dir == "DC") {i++;j--;}
				if(Dir == "DB")	{i--;j--;}
				if(Dir == "EC")	{i++;j++;}
				if(Dir == "EB")	{i--;j++;}

				tabuleiro[i][j].blendTo({LocX:20,LocY:0},1000);
				tabuleiro[i][j] = 0;
				numPecaB--;
				comeu = true;				
				return str+i+"$"+j;
			}
	}
	else{
		if(Dir == "DC") {i--;j++;}
		if(Dir == "DB")	{i++;j++;}
		if(Dir == "EC")	{i--;j--;}
		if(Dir == "EB")	{i++;j--;}
	
		if(tabuleiro[i][j] != 0)
			if(tabuleiro[i][j].id != tabuleiro[posP.li][posP.co].id)
				Peca = tabuleiro[i][j];
			else
				return true;
		do{
			if(Dir == "DC") {i--;j++;}
			if(Dir == "DB")	{i++;j++;}
			if(Dir == "EC")	{i--;j--;}
			if(Dir == "EB")	{i++;j--;}
			
			if(tabuleiro[i][j] != 0 && i != posP.li && j != posP.co)
				return false;
			if(tabuleiro[posP.li][posP.co].id == tabuleiro[i][j].id)
				mesmaDiagonal = true;
			
		}while(tabuleiro[posP.li][posP.co].id != tabuleiro[i][j].id || i<0 || i>7 || j<0 || j>7);
		if(!mesmaDiagonal)
			return false;
		if(Peca != 0)
			if(Peca.id[0] == "P")
			{
				i = posQ.li;
				j = posQ.co;
				if(Dir == "DC") {i--;j++;}
				if(Dir == "DB")	{i++;j++;}
				if(Dir == "EC")	{i--;j--;}
				if(Dir == "EB")	{i++;j--;}
	
				tabuleiro[i][j].blendTo({LocX:20,LocY:0},1000);
				tabuleiro[i][j] = 0;	
				comeu = true;
				numPecaP--;
				return str+i+"$"+j;
			}

	}
	return true;
}

function comeSeguido(posP,advr)
{
	var tipoCome;
	comeu = false;
	if(!advr)
		advr = false;
	if(!advr){
		if(play1){
			tipoCome = "B";
			//numPecaB--;
		}else{
			tipoCome = "P";
			//numPecaP--;
		}	
	}else{
		if(!play1){
			tipoCome = "B";
			//numPecaB--;
		}else{
			tipoCome = "P";
			//numPecaP--;
		}
	}
	
	if(posP.li > 1 && posP.co > 1)
		if(tabuleiro[posP.li-2][posP.co-2] == 0)
			if(tabuleiro[posP.li-1][posP.co-1] != 0)
				if(tabuleiro[posP.li-1][posP.co-1].id[0] == tipoCome)
					return true;
	if(posP.li < 6 && posP.co > 1)
		if(tabuleiro[posP.li+2][posP.co-2] == 0)
			if(tabuleiro[posP.li+1][posP.co-1] != 0)
				if(tabuleiro[posP.li+1][posP.co-1].id[0] == tipoCome)
					return true;
	if(posP.li < 6 && posP.co < 6)
		if(tabuleiro[posP.li+2][posP.co+2] == 0)
			if(tabuleiro[posP.li+1][posP.co+1] != 0)
				if(tabuleiro[posP.li+1][posP.co+1].id[0] == tipoCome)
					return true;
	if(posP.li > 1 && posP.co < 6)
		if(tabuleiro[posP.li-2][posP.co+2] == 0)
			if(tabuleiro[posP.li-1][posP.co+1] != 0)
				if(tabuleiro[posP.li-1][posP.co+1].id[0] == tipoCome)
					return true;
					
	return false;
}
function Ganhador()
{
	if(numPecaP == 0 && numPecaB > 1)
	{
		document.getElementById("vez").innerHTML = "Jogador 2 GANHOU!!";
		document.getElementById("vez").style.width = "700";
		document.getElementById("vez").style.height = "540";
		document.getElementById("vez").style.color = "rgb(30,66,17)";
		document.getElementById("vez").style.backgroundColor = "rgba(255,255,255,0.5)";
		document.getElementById("vez").style.marge = "auto";
		document.getElementById("vez").style.fontSize = "200%";
	}else{
			if(numPecaB == 0 && numPecaP > 1)
			{
				document.getElementById("vez").innerHTML = "Jogador 1 GANHOU!!";
				document.getElementById("vez").style.width = "700";
				document.getElementById("vez").style.height = "540";
				document.getElementById("vez").style.color = "rgb(30,66,17)";
				document.getElementById("vez").style.backgroundColor = "rgba(255,255,255,0.5)";
				document.getElementById("vez").style.marge = "auto";
				document.getElementById("vez").style.fontSize = "200%";
			}
			else{
				if(numPecaB == 1 && numPecaP == 1)
				{
					document.getElementById("vez").innerHTML = "Empate =D!!";
					document.getElementById("vez").style.width = "700";
					document.getElementById("vez").style.height = "540";
					document.getElementById("vez").style.color = "rgb(30,66,17)";
					document.getElementById("vez").style.backgroundColor = "rgba(255,255,255,0.5)";
					document.getElementById("vez").style.marge = "auto";
					document.getElementById("vez").style.fontSize = "200%";
				}
			}
				
		}
		
}
function Estado()
{
	if(!online)
	{
		document.getElementById("estado").innerHTML = "REDE OFFLINE";
		document.getElementById("estado").style.backgroundColor = "rgba(255,255,255,0.5)";
	}
	else{
		if(document.getElementById("estado").innerHTML == "Conectado")
			document.getElementById("estado").style.backgroundColor = "rgba(30,66,17,0.5)";
		else
			document.getElementById("estado").style.backgroundColor = "rgba(247,24,10,0.5)";
	}
}
