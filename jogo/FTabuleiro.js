function addQuad(x,y,c)
{
	var ncubo = new GLGE.Object();
	ncubo.setMesh(doc.getElement("MCubo"));
	if(c == "B"){
		ncubo.setMaterial(doc.getElement("Material_branco"));
		ncubo.setPickable(false);
	}
	else
		ncubo.setMaterial(doc.getElement("Material_preto"));
	ncubo.setScaleX(2);
	ncubo.setScaleY(2);
	ncubo.setScaleZ(0.1);
	ncubo.setId("Quad"+numQuad);
	ncubo.setLocX(x);
	ncubo.setLocY(y);
	ncubo.setLocZ(1);
	numQuad++;
	
	jogoCena.addObject(ncubo);
	return ncubo;

}
function addPeca(x,y,c)
{
	var ncubo = new GLGE.Collada();
	ncubo.setDocument("peao.dae");
	if(c == "B")
		ncubo.setMaterial(doc.getElement("branco"));
	else
		ncubo.setMaterial(doc.getElement("preto"));
	ncubo.setScaleX(1.5);
	ncubo.setScaleY(1.5);
	ncubo.setScaleZ(1);
	ncubo.setId(c+"PN"+numQuad);
	ncubo.setLocX(x);
	ncubo.setLocY(y);
	ncubo.setLocZ(2.5);
	numQuad++;
	
	jogoCena.addObject(ncubo);
	return ncubo;

}
function InitTabu()
{
	for(var i = 0;i < 8; i++)
		tabuleiro[i] = new Array(8);
	for(var i = 0;i < 8; i++)
		tabuleiroQuad[i] = new Array(8);

	//Coloca os quadrados pretos e brancos no tabuleiro
	
	var x = -14;
	var y = -15;
	var k = 7;
	var l = 0;
	for(var i=0;i<4;i++)
	{
		for(var j=0;j<4;j++)
		{
			
				tabuleiroQuad[k][l] = addQuad(x,y,"P");
			x+=8;
			l+=2;
		}
		k -= 2;
		l = 0;
		x = -14;
		y+=8;
	}
	x = -10;
	y = -11;
	k = 6;
	l = 1;
	for(var i=0;i<4;i++)
	{
		for(var j=0;j<4;j++)
		{
			
			tabuleiroQuad[k][l] = addQuad(x,y,"P");
			x+=8;
			l+=2;
		}
		k -=2;
		l = 1;
		x = -10;
		y+=8;
	}
	x = -10;
	y = -15;
	k = 7;
	l = 1;
	for(var i=0;i<4;i++)
	{
		for(var j=0;j<4;j++)
		{
			
			tabuleiroQuad[k][l] = addQuad(x,y,"B");
			x+=8;
			k-=2;
			
		}
		k=7;
		l +=2;
		x = -10;
		y+=8;
	}
	x = -14;
	y = -11;
	k = 6;
	l = 0;
	for(var i=0;i<4;i++)
	{
		for(var j=0;j<4;j++)
		{
			tabuleiroQuad[k][l] = addQuad(x,y,"B");
			x+=8;
			k-=2;
		}
		k = 6;
		l +=2;
		x = -14;
		y+=8;
	}
	//---------------------------------------------------------
	//---------------------------------------------------------
	//------------Coloca as pecas no tabuleiro-----------------
	//Pecas pretas
	for(var i=0;i<8;i++)
	{
		for(var j=0;j<8;j++)
		{
			tabuleiro[i][j] = 0;
		
		}
	}
	
	x = -13;
	y = -18;
	for(var i=0;i<8;i++)
	{	
		tabuleiro[7][i] = addPeca(x,y,"P");
		x+=8;
	}
	x = -9;
	y = -14;
	for(var i=1;i<8;i+=2)
	{	
		tabuleiro[6][i] = addPeca(x,y,"P");
		x+=8;
	}
	x = -13;
	y = -10;
	for(var i=0;i<8;i+=2)
	{	
		tabuleiro[5][i] = addPeca(x,y,"P");
		x+=8;
	}
	x = -10;
	y = -11;
	//Pecas Brancas	
	x = -9;
	y = 10;
	for(var i=1;i<8;i+=2)
	{	
		tabuleiro[0][i] = addPeca(x,y,"B");
		x+=8;
	}
	x = -13;
	y = 6;
	for(var i=0;i<8;i+=2)
	{	
		tabuleiro[1][i] = addPeca(x,y,"B");
		x+=8;
	}
	x = -9;
	y = 2;
	for(var i=1;i<8;i+=2)
	{	
		tabuleiro[2][i] = addPeca(x,y,"B");
		x+=8;
	}
	x = -10;
	y = 11;

	//-----------------------------------------------------
	//-----------------------------------------------------	
}
function inicio()
{
	if(online){
		tcpEnvia("I");
	}
	location.href = "index.html";	
}
