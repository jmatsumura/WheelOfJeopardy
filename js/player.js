var Player = {
	id: "",
	name: "",
	score: 0,
	token: 0,
	is_bankrupt: false,
	selector: "#players",
	
	setName: function(name) {
		this.name = name;
	},
	setID: function(id) {
		this.id = id;
	},
	getScore: function() {
		return this.score;
	},
	checkToken: function() {
		return this.token > 0;
	},
	addToken: function() {
		this.token += 1;
		$("#player_" + this.id + " .token").html(this.token);
	},
	removeOneToken: function() {
		this.token -= 1;
		alert("Use one token!");
		$("#player_" + this.id + " .token").html(this.token);
	},
	calculatePoints: function (point) {
		this.score = this.score + parseInt(point);
		console.log(this.name + " : " + this.score);
		$("#player_" + this.id + " .score").html(this.score);
	},
	setBankrupt: function () {
		this.is_bankrupt = true;
		this.score = 0;
		$("#player_" + this.id).addClass("red");
	},
	checkBankrupt: function() {
		return this.is_bankrupt;
	},
	getPlayer: function() {
		var current = "";
		if(this.id == 0) {
			current="current"
		}
		return "<div id='player_" + this.id +"' class='" + current + "'><span>" + this.name + "</span>" +
			   "<div>Score: <span class='score'>" + this.score + "</span></div>" +
			   "<div>Token: <span class='token'>" + this.token + "</span></div></div>";
	},
	init: function(name, id) {
		this.setName(name);
		this.setID(id);
		var html = this.getPlayer();
		$(this.selector).append(html);
	}
};