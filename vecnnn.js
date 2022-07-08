class vec extends Array{
	constructor(...a){
		if(a.length == 1){
			super(1);
			this[0] = a[0];
		}else{
			super(...a)
		}
	}
	get x(){
		return this[0];
	}
	get y(){
		return this[1];
	}
	get z(){
		return this[2];
	}
	set x( value ){
		this[0] = value;
	}
	set y( value ){
		this[1] = value;
	}
	set z( value ){
		this[2] = value;
	}
	swizzle( arr ){
		if( arr.length == 2){
			return new vec2( ...arr.map( i => this[i] ) );
		}else if( arr.length == 3){
			return new vec3( ...arr.map( i => this[i] ) );
		}
		return new vec( ...arr.map( i => this[i] ) );
	}
	add(v){
		return this.map( (x0, index) => x0 + v[ index ] ) ;
	}
	sAdd(v){
		this.forEach( function(x0, index, arr){
			arr[index] += v[ index ];
		});
		return this;
	}
	subtract(v){
		return this.map( (x0, index) => x0 - v[ index ] );
	}
	sSubtract(v){
		this.forEach( function(x0, index, arr){
			arr[index] -= v[ index ];
		});
		return this;
	}
	scale(s){
		return this.map( x0 => x0*s );
	}
	sScale(s){
		this.forEach( function(x0, index, arr){
			arr[index] *= s;
		});
		return this;
	}
	mult(v){
		return this.map( (x0, index) => x0*v[ index ] );
	}
	sMult(v){
		this.forEach( function(x0, index, arr){
			arr[index] *= v[index];
		});
		return this;
	}
	divide(v){
		return this.map( (x0, index) => x0/v[ index ] );
	}
	sDivide(v){
		this.forEach( function(x0, index, arr){
			arr[index] /= v[index];
		});
		return this;
	}
	norm(){
		return Math.sqrt( this.reduce( (sum, x0) => sum + x0*x0, 0 ) );
	}
	norm_2(){
		return this.reduce( (sum, x0) => sum + x0*x0, 0 );
	}
	dist(v){
		return this.subtract(v).norm();
	}
	dist_2(v){
		return this.subtract(v).norm_2();		
	}
	normalise(){
		var s = 1/this.norm();
		return this.scale(s);
	}
	sNormalise(){
		var s = 1/this.norm();
		this.sScale(s);
		return this;
	}
	setNorm(s){
		this.sScale( s/this.norm() );
		return this;
	}
	dot(v){
		return this.reduce( ( sum, x0, index) =>  sum + x0*v[index], 0 );
	}
	projectOn(v){
		return v.scale( this.dot(v)/v.norm_2() );
	}
	sProjectOn(v){
		return v.sScale( this.dot(v)/v.norm_2() );
	}
	rejectOn(v){
		return this.subtract( this.projectOn(v) );
	}
	sRejectOn(v){
		return this.sSubtract( this.projectOn(v) );
	}
	angleWith(v){
		return Math.acos( this.dot(v)/( this.length()*v.length() ) );
	}
	rotateInPlane(u, v, theta){
		u = u.normalise();
		v = v.rejectOn( u );
		let c = Math.cos( theta ) - 1;
		let s = Math.sin( theta );
		let dotU = this.dot( u );
		let dotV = this.dot( v );
		console.log(u,v, c, s, dotU, dotV);
		return this.add( u.scale( c*dotU - s*dotV ).add( v.scale( s*dotU + c*dotV ) ) );
	}
	sRotateLeft(n){
		var len = this.length >>> 0, // convert to uint
            n = n >> 0; // convert to int

        // convert count to value in range [0, len)
        n = ((n % len) + len) % len;

        // use splice.call() instead of this.splice() to make function generic
        this.push.apply(this, this.splice.call(this, 0, n));
        return this;
	}
	rotateLeft(n){
		var len = this.length >>> 0, // convert to uint
            n = n >> 0; // convert to int

        // convert count to value in range [0, len)
        n = ((n % len) + len) % len;
		
		return this.slice(n).concat( this.slice(0, n) );
        // use splice.call() instead of this.splice() to make function generic
       // this.push.apply(this, this.splice.call(this, 0, n));
       // return this;
	}
	equals(v){
		return this.every( (x0, index) => { return x0 === v[index] } );
	}
	set(v){
		this.forEach( function(x0, index, arr){
			arr[index] = v[ index ];
		});
	}
	c(){
		return this.concat([]);
	}
	clone(){
		return this.concat([]);
	}
	repeat(n=2){
		return vec.zeros(n).fill( this ).flat();
	}
	
	static zeros(n){
		return new vec( ... new Array(n).fill(0) );
	}
	static ones(n){
		return new vec( ... new Array(n).fill(1) );
	}
	static constant(n, c){
		return new vec( ... new Array(n).fill(c) );
	}
	static range(a, b=0, stepsize=1){
		let start = Math.min(a, b);
		let end = Math.max(a, b);
		if( stepsize == 1){
			return vec.zeros( Math.floor(end - start) ).map( (x, index) => {return index + start} );
		}else{
			return vec.zeros( Math.floor( (end - start)/stepsize ) ).map( (x, index) => {return index*stepsize + start} );
		}	
	}
	static rangeN(a, b=0, n=1){
		return this.range( a, b, Math.abs(a - b)/n );	
	}
	static random(n, a=-1, b=1){
		var range = b - a;
		return new vec( ... new Array(n).fill(0).map( _ => range*Math.random() + a ) );
	}
	static randomGaussian(n){
		if( n<= 0){
			if( n<0 )
				console.error('randomGaussian was called with n<=0');
			return new vec();
		}
		var n2 = Math.round( (n + .1)/2 );

		var U1 = vec.random(n2, 0, 1);
		var U2 = vec.random(n2, 0, 2*Math.PI);
		var R = U1.map( x => { 
			return Math.sqrt( -2*Math.log( x ) ) 
		} );
		var Z1 = R.mult( U2.map( Math.cos ) );
		var Z2 = R.mult( U2.map( Math.sin ) );
		return Z2.concat( Z1 ).splice( 2*n2 - n );
	}
}
	
class vec2 extends vec{
	constructor(x, y){
		super(x, y);
	}
	
	norm(){
		return Math.sqrt(this.x*this.x + this.y*this.y);
	}
	norm_2(){
		return this.x*this.x + this.y*this.y;
	}
	dist(v){
		return this.subtract(v).norm();
	}
	dist_2(v){
		return this.subtract(v).norm_2();		
	}
	normalise(){
		let l = 1/this.norm();
		return new vec2(this.x*l, this.y*l);
	}
	sNormalise(){
		let l = 1/this.norm();
		this.x *= l;
		this.y *= l;
		return this;
	}
	add(v){
		return new vec2(this.x + v.x, this.y + v.y);
	}
	sAdd(v){
		this.x += v.x;
		this.y += v.y;
		return this;
	}
	subtract(v){
		return new vec2(this.x - v.x, this.y - v.y);
	}
	sSubtract(v){
		this.x -= v.x;
		this.y -= v.y;
		return this;
	}
	scale(s){
		return new vec2(this.x*s, this.y*s);
	}
	sScale(s){
		this.x *= s;
		this.y *= s;
		return this;
	}
	mult(v){
		return new vec2(this.x*v.x, this.y*v.y);
	}
	sMult(v){
		this.x *= v.x;
		this.y *= v.y;
	}
	divide(v){
		return new vec2(this.x/v.x, this.y/v.y);
	}
	sDivide(v){
		this.x /= v.x;
		this.y /= v.y;
	}
	rotate(angle){
		let cosa = Math.cos(angle);
		let sina = Math.sin(angle);
		return new vec2(this.x*cosa - this.y*sina, this.x*sina + this.y*cosa);
	}
	sRotate(angle){
		let cosa = Math.cos(angle);
		let sina = Math.sin(angle);
		let oldx = this.x;
		this.x = this.x*cosa - this.y*sina;
		this.y =   oldx*sina + this.y*cosa;
		return this;
	}
	angleWith(v){
		return Math.acos(this.dot(v)/( this.length()*v.length() ));
	}
	angle(){
		return Math.atan2( this.y, this.x );
	}
	equals(v){
		return this.x === v.x && this.y === v.y;
	}
	set(x, y){
		this.x = x;
		this.y = y;
		return this;
	}
	c(){
		return new vec2(this.x, this.y);
	}
	clone(){
		return new vec2(this.x, this.y);
	}
	swizzle( str ){
		let arr = [];
		while( str.length > 0){
			if( str.startsWith('x') ){
				arr.push( this.x );
			}else if( str.startsWith('y') ){
				arr.push( this.y );
			}else{
				return false;
			}
			str = str.slice(1);
		}
		return new vec( ...arr);
	}
	cross(v){
		return this.x*v.y - this.y*v.x;
	}
	crossWithZ(z){
		return new vec2(this.y*z, -this.x*z);
	}	
	
	static zeros(){
		return new vec2(0, 0);
	}
	static ones(){
		return new vec2(1, 1);
	}
	static constant(c){
		return new vec2(c, c);
	}
	static random(a=-1, b=1){
		var range = b - a;
		return vec2.zeros().map( x => range*Math.random() + a );
	}
	static random2(ax=-1, bx=1, ay=-1, by=1){
		return new vec2( ax + Math.random()*(bx - ax), ay + Math.random()*(by - ay) );
	}
	static randomUnit(){
		let theta = 2*Math.PI*Math.random();
		return new vec2( Math.cos(theta), Math.sin(theta) );
	}
	static fromPolar( theta=0, r=1 ){
		return new vec2( r*Math.cos(theta), r*Math.sin(theta) );
	}
	draw(ctx, startPos, options={}){
		let default_options = {
			arrowHeadLength: 15,
			arrowHeadAngle: .4,
			lineWidth: 1.1,
			color: 'black'
		};
		let endPos = startPos.add( this );
		let l = this.norm();
		let angle = this.angle();
		
		for(var opt in default_options){
			if (default_options.hasOwnProperty(opt) && !options.hasOwnProperty(opt))
            options[opt] = default_options[opt];
		}
		
		let trueArrowHeadLength = Math.min(options.arrowHeadLength, l*.5);
		ctx.save();
		ctx.beginPath();
		ctx.strokeStyle = options.color;
		ctx.fillStyle = options.color;
		//ctx.lineJoin = 'bevel';
		ctx.lineWidth = options.lineWidth;;
		ctx.moveTo(startPos.x, startPos.y);
		ctx.lineTo(endPos.x, endPos.y);
		ctx.stroke();
		ctx.beginPath();
		ctx.lineTo(
			endPos.x + trueArrowHeadLength*Math.cos(Math.PI + angle - options.arrowHeadAngle), 
			endPos.y + trueArrowHeadLength*Math.sin(Math.PI + angle - options.arrowHeadAngle)
		);
		ctx.lineTo(
			endPos.x + trueArrowHeadLength*Math.cos(Math.PI + angle + options.arrowHeadAngle), 
			endPos.y + trueArrowHeadLength*Math.sin(Math.PI + angle + options.arrowHeadAngle)
		);
		ctx.lineTo(endPos.x, endPos.y);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.restore();
	}
}

class vec3 extends vec{
	constructor(x, y, z){
		super(x, y, z);
	}
	cross(v){
		return new vec3( this.y*v.z  - this.z*v.y,
						 this.z*v.x  - this.x*v.z,
						 this.x*v.y  - this.y*v.x
						 );
	}
	rotate(angle){
		//TODO
		//let cosa = Math.cos(angle);
		//let sina = Math.sin(angle);
		//return new vec2(this.x*cosa - this.y*sina, this.x*sina + this.y*cosa);
	}
	sRotate(angle){
		//let cosa = Math.cos(angle);
		//let sina = Math.sin(angle);
		//let oldx = this.x;
		//this.x = oldx*cosa - this.y*sina;
		//this.y = oldx*sina + this.y*cosa;
	}
	set(x, y, z){
		this.x = x;
		this.y = y;
		this.z = z;
		return this;
	}
	newX(x){
		return new vec3( x, this.y, this.z );
	}
	newY(y){
		return new vec3( this.x, y, this.z );
	}
	newZ(z){
		return new vec3( this.x, this.y, z );
	}
	sNewX(x){
		this.x = x;
		return this;
	}
	sNewY(y){
		this.y = y;
		return this;
	}
	sNewZ(z){
		this.z = z;
		return this;
	}
	swizzle( str ){
		let arr = [];
		while( str.length > 0){
			if( str.startsWith('x') ){
				arr.push( this.x );
			}else if( str.startsWith('y') ){
				arr.push( this.y );
			}else if( str.startsWith('z') ){
				arr.push( this.z );
			}else{
				return false;
			}
		}
		return new vec( ...arr);
	}
	
	static zeros(n){
		return new vec3(0, 0, 0);
	}
	static ones(n){
		return new vec3(1, 1, 1);
	}
	static constant(c){
		return new vec3(c, c, c);
	}
	static random(a=-1, b=1){
		var range = b - a;
		return vec3.zeros().map( x => range*Math.random() + a );
	}
	static fromSpherical( theta=0, phi=0, r=1 ){
		let s = Math.sin(theta);
		return new vec3( r*s*Math.cos(phi), r*s*Math.sin(phi), r*Math.cos(theta) );
	}
}
class mat extends Array{
	constructor(...a){
		if(a.length == 1){
			super(1);
			this[0] = a[0];
		}else{
			super(...a)
		}
	}
}
/*
vecn.make = function(n){
	var arr = [];
	for(var i=1; i<arguments.length && arr.length < n; i++){
		if(typeof arguments[i].x === 'number'){ //check for vec2, vec3 like objects
			arr.push(arguments[i].x);
			if(typeof arguments[i].y === 'number'){
				arr.push(arguments[i].y);
				if(typeof arguments[i].z === 'number'){
					arr.push(arguments[i].z);
				}
			}
		}else if(typeof arguments[i].x !== 'undefined' && typeof arguments[i].x.length !== 'undefined' && arguments[i].x.length > 0){ //check for vecn like objects
			for(let j=0; j<arguments[i].x.length; j++){
				arr.push(arguments[i].x[j]);
			}
		}else if(typeof arguments[i].length !== 'undefined' && arguments[i].length > 0){ //check for arrays
			for(let j=0; j<arguments[i].length; j++){
				arr.push(arguments[i][j]);
			}
		}else if(typeof arguments[i] == 'number'){ //check for plain numbers
			arr.push(arguments[i]);
		}
	}
	if(arr.length == 0){ //if no numbers are found the first number will be zero
		arr[0] = 0;
	}
	while( arr.length < n ){ //if array is too short the remainder will be padded with last element
		arr[ arr.length ] = arr[ arr.length - 1];
	}
	if( arr.length > n){ //if the array is too long discard the last past
		arr = arr.slice( 0, n );
	}
	return new vecn( arr );
};
*/