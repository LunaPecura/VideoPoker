/* HELPER FUNCTIONS----------------------------------------------------------------------*/
/*---------------------------------------------------------------------------------------*/
function getRandomInt(min, max) { // taken from MDN
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1) + min); 
} // END OF HELPER FUNCTION "getRandomInt()"
/*---------------------------------------------------------------------------------------*/
function stringToCamelCase(str) {
	let array = str.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1));
	array[0] = array[0].toLowerCase();
	let camelCase = array.reduce((str1, str2) => str1 + str2);
	return camelCase;
} // END OF HELPER FUNCTION "stringToCamelCase()"
/*---------------------------------------------------------------------------------------*/



/* CLASSES-------------------------------------------------------------------------------*/
/*---------------------------------------------------------------------------------------*/
class Card {
	#rank = 0; // int between 2 and 14 (... 10, jacks, queen, king, ace)
	#suit = 0; // int between 1 and 4 (clubs, diamonds, hearts, spades)

	constructor(rank, suit) {
		this.rank = rank;
		this.suit = suit;
	}

	// METHODS
	getRankID() { return this.rank; }
	getSuitID() { return this.suit; }
	isRed() { return (this.suit === 2 || this.suit === 3); }
	isHighCard() { return (this.rank > 10); }
	isAce() { return (this.rank === 14); }

	toString() {
		let newString = (this.rank <= 10) ? this.rank.toString() : "";
		switch(this.rank) {
			case 11: newString += "J"; break;
			case 12: newString += "Q"; break;
			case 13: newString += "K"; break;
			case 14: newString += "A"; break;
			default: newString += ""; break;
		}
		switch(this.suit) {
			case 1: newString += "\u2663"; break;
			case 2: newString += "\u2666"; break;
			case 3: newString += "\u2665"; break;
			case 4: newString += "\u2660"; break;
			default: newString += ""; break;
		}
		return newString;
	}

} // END OF CLASS "Card"
/*---------------------------------------------------------------------------------------*/
class Hand {
	#cards;	// array of (usually 5) cards
	#ranks;	// array of corresponding ranks, r e {2,...,14}
	#suits;	// array of corresponding suits, s e {1,...,4}
	#outcome;
	#holdsPostSorting;
	#holds;

	constructor(cardArray) {
		this.cards = [...cardArray];
		this.ranks = this.cards.map(card => card.getRankID());
		this.suits = this.cards.map(card => card.getSuitID());
		this.outcome = "";
		this.holdsPostSorting = [];
		this.holds = [];
	}

	addCard(newCard) {
		this.cards.push(newCard);
		this.ranks.push(newCard.getRankID());
		this.suits.push(newCard.getSuitID());
	}

	/*** returns the i-th card / rank / suit of the hand, i e {1,...,5} */
	getCard(i) { return this.cards[i-1]; } 
	getRank(i) { return this.ranks[i-1]; }
	getSuit(i) { return this.suits[i-1]; }

	/*** returns a copy of the array of cards / ranks / suits associated with the hand */
	getCardArray() { return [...this.cards]; } 
	getRankArray() { return [...this.ranks]; } 
	getSuitArray() { return [...this.suits]; } 

	toString() {
		return this.cards.map(card => card.toString()).
							reduce((s1,s2) => s1 + "|" + s2);
	}

	getOutcome() {
		return this.determineResult();
	}

	getPayout() {
		return this.determineResult();
	}

	/*** returns a new hand with the cards sorted according to their rank */
	sortByRank() { 
		let cardsCopy = this.getCardArray(); // don't mutate original 'cards' array!
		let sortedCards = cardsCopy.sort((c1,c2) => c1.getRankID()-c2.getRankID());
		return new Hand(sortedCards);
	} 

	/*** helper function for determining result */
	/*** returns the array of "steps" through the sorted rank array */
	deltaArray() {
		let sortedRanks = this.sortByRank().getRankArray();
		let deltaArray = [];
		[1,2,3,4].forEach(i =>
			deltaArray.push(sortedRanks[i] - sortedRanks[i-1]));
		return deltaArray;
	}

	/*** helper function for determining result */
	containsFlush() {
		return this.suits.map(suit => suit === this.suits[0]).
							reduce((p,q) => p && q);
	}

	determineResult() { 
		let sortedCards = this.sortByRank().cards;
		let deltas = this.deltaArray();

		// CASE 1: outcome in the 'straight' family (RF, SF, S)
		let delta1 = deltas.map(d => (d===1) ? "1" : "x").reduce((s1,s2) => s1+s2);
		if(delta1 === "1111") {  // check for straight
			this.holdsPostSorting = [1,2,3,4,5];
			if(this.containsFlush()) { // check for straight flush
				if(sortedCards[4].isAce()) { // check for royal flush
					this.outcome = "royal flush"; return this.outcome; }
				else { this.outcome = "straight flush"; return this.outcome; } 
			} else { this.outcome = "straight"; return this.outcome; } 
		} 

		// CASE 2A - 2C: result involves multiples (Q, H, T, PP, HP. LP)
		let delta0 = deltas.map(d => (d===0) ? "0" : "x").reduce((s1,s2) => s1+s2);
		switch(delta0) { 
			case "x000": this.holdsPostSorting = [2,3,4,5]
				this.outcome = "four of a kind"; return this.outcome;
			case "000x": this.holdsPostSorting = [1,2,3,4];
				this.outcome = "four of a kind"; return this.outcome;
			case "0x00": this.holdsPostSorting = [1,2,3,4,5];
				this.outcome = "full house"; return this.outcome;
			case "00x0": this.holdsPostSorting = [1,2,3,4,5];
				this.outcome = "full house";	return this.outcome;
			case "00xx": this.holdsPostSorting = [1,2,3];
				this.outcome = "three of a kind"; return this.outcome;
			case "x00x": this.holdsPostSorting = [2,3,4];
				this.outcome = "three of a kind"; return this.outcome;
			case "xx00": this.holdsPostSorting = [3,4,5];
				this.outcome = "three of a kind"; return this.outcome;
			case "0xx0": this.holdsPostSorting = [1,2,4,5];
				this.outcome = "two pair"; return this.outcome;
			case "0x0x": this.holdsPostSorting = [1,2,3,4];
				this.outcome = "two pair"; return this.outcome;
			case "x0x0": this.holdsPostSorting = [2,3,4,5];
				this.outcome = "two pair"; return this.outcome;
			case "0xxx": this.holdsPostSorting = [1,2];
				this.outcome = (sortedCards[1].isHighCard()) ? "jacks or better" : "low pair";
				return this.outcome;
			case "x0xx": this.holdsPostSorting = [2,3];
				this.outcome = (sortedCards[2].isHighCard()) ? "jacks or better" : "low pair";
				return this.outcome;
			case "xx0x": this.holdsPostSorting = [3,4];
				this.outcome = (sortedCards[3].isHighCard()) ? "jacks or better" : "low pair";
				return this.outcome;
			case "xxx0": this.holdsPostSorting = [4,5];
				this.outcome = (sortedCards[4].isHighCard()) ? "jacks or better" : "low pair";
				return this.outcome;
			case "xxxx": this.holdsPostSorting = [1,2,3,4,5].filter(i => sortedCards[i-1].isHighCard());
				this.outcome = "high card"; return this.outcome;
		}

		// CASE 3: check for flush 
		if(this.containsFlush()) { 
			this.holdsPostSorting = [1,2,3,4,5];
			this.outcome = "flush";
			return this.outcome;
		}

		// CASE 4: not a paying outcome
		this.outcome = "none";
		return this.outcome;

	} // END OF METHOD determineResult()

	suggestedHolds() {
		let sortedCards = this.sortByRank().cards;
		this.holds = this.holdsPostSorting.map(i => this.cards.indexOf(sortedCards[i-1]) + 1);
		return this.holds;
	}

	determinePayout() {
		//if(this.result !== "") { this.determineResult(); }

		switch(this.getOutcome()) {
			case "royal flush": this.payout = 250; return this.payout;
			case "straight flush": this.payout = 50; return this.payout;
			case "four of a kind": this.payout = 25; return this.payout;
			case "full house": this.payout = 9; return this.payout;
			case "flush": this.payout = 6; return this.payout;
			case "straight": this.payout = 4; return this.payout;
			case "three of a kind": this.payout = 3; return this.payout;
			case "two pair": this.payout = 2; return this.payout;
			case "jacks or better": this.payout = 1; return this.payout;
			case "low pair": this.payout = 0; return this.payout;
			case "none": this.payout = 0; return this.payout;
			default: this.payout = 0; return this.payout;
		}
	}
} // END OF CLASS "Hand"
/*---------------------------------------------------------------------------------------*/
class Deck {
	cards = [];

	constructor() {
		for(let suit = 1; suit <= 4; suit++) {
			for(let rank = 2; rank <= 14; rank++) {
				this.cards.push(new Card(rank, suit));
			}
		}
	}

	currentSize() {
		return this.cards.length;
	}

	drawCard() {
		let randomInt = getRandomInt(1, this.currentSize());
		let randomCard = this.cards[randomInt-1];
		this.cards.splice(randomInt-1, 1);
		return randomCard;
	}

	dealHand() { 
		return new Hand([1,2,3,4,5].map(i => this.drawCard()));
	}

} // END OF CLASS "Deck"
/*---------------------------------------------------------------------------------------*/
class ButtonHandler {
	selector;
	handler;

	constructor(selector) {
		this.selector = selector;
		this.handler = document.querySelector(this.selector); 
	}

	// METHODS
	enable() { this.handler.removeAttribute("disabled"); }
	disable() { this.handler.setAttribute("disabled", true); }
	addClass(className) { this.handler.classList.add(className); }
	removeClass(className) { this.handler.classList.remove(className);}

} // END OF CLASS "ButtonHandler"
/*---------------------------------------------------------------------------------------*/
class DisplayHandler {
	selector;
	handler; 

	constructor(selector){
		this.selector = selector;
		this.handler = document.querySelector(this.selector);
	}

	// METHODS
	replaceContent(content) { this.handler.innerHTML = content; }
	addContent(content) { this.handler.innerHTML += content; }
	setFontColor(newColor) { (this.handler).style.color = newColor; }
	addClass(className) { this.handler.classList.add(className); }
	removeClass(className) { this.handler.classList.remove(className); }

} // END OF CLASS "DisplayHandler"
/*---------------------------------------------------------------------------------------*/
class Screen {

	// DISPLAY HANDLERS
	resultDisplay = new DisplayHandler(".display.result");
	roundDisplay = new DisplayHandler(".display.round");
	creditDisplay = new DisplayHandler(".display.credit");
	cardDisplays = [1,2,3,4,5].map(i => new DisplayHandler("#cardArea" + i));
	gameOverDisplay = new DisplayHandler(".gameOver");
	logDisplay = new DisplayHandler(".displayLog");

	// BUTTON HANDLERS
	newGameButton = new ButtonHandler(".actionButton.newGame");
	dealButton = new ButtonHandler(".actionButton.deal");
	autoHoldButton = new ButtonHandler(".actionButton.autoHold");
	drawButton = new ButtonHandler(".actionButton.draw");
	holdButtons = [1,2,3,4,5].map(i => new ButtonHandler("#holdButton" + i));
	autoRoundButton = new ButtonHandler(".actionButton.autoRound");
	autoGameButton = new ButtonHandler(".actionButton.autoGame");



	// METHODS

	updateRound(n) {
		this.roundDisplay.replaceContent("Round " + n.toString());
		this.roundDisplay.setFontColor("white");
	}

	setCredit(newCredit) {
		this.creditDisplay.replaceContent("Credit: " + newCredit.toString());
		this.creditDisplay.setFontColor("white");
	}

	updateCredit(oldCredit, newCredit) {
		this.creditDisplay.replaceContent("Credit: " + newCredit.toString() + 
			"   (+" + (newCredit-oldCredit).toString() + ")");
		let fontColor = (newCredit > oldCredit) ? "lightgreen" : "lightcoral";
		this.creditDisplay.setFontColor(fontColor);
	}

	clearPayoutBoard() {
		document.querySelectorAll(".payoutElement.highlighted")
				.forEach(element => element.classList.remove("highlighted"));
		document.querySelectorAll(".payoutElement.soft")
				.forEach(element => element.classList.remove("soft"));
		document.querySelectorAll(".payoutElement.strong")
				.forEach(element => element.classList.remove("strong"));
	}

	// update outcome display to post-deal state
	odDeal(initialResult) {
		this.resultDisplay.replaceContent(initialResult.toUpperCase());
		let fontColor = (initialResult !== "none") ? "lightgreen" : "lightcoral";
		this.resultDisplay.setFontColor(fontColor);
	}

	// update outcome display to post-draw state
	odDraw(finalResult) {
		this.resultDisplay.replaceContent(finalResult.toUpperCase());
		let fontColor = (finalResult !== "none") ? "lightgreen" : "lightcoral";
		this.resultDisplay.setFontColor(fontColor);
	}

	// update the payboard to post-deal state
	pbDeal(initialResult) {
		if(initialResult !== "none" && initialResult !== "low pair" && initialResult !== "high card") {
			let divLeft = document.querySelector("#" + stringToCamelCase(initialResult));
			divLeft.classList.add("highlighted", "soft");
			let divRight = document.querySelector("#" + stringToCamelCase(initialResult) + "Payout");
			divRight.classList.add("highlighted", "soft");
		}
	}

	// update the payboard to post-draw state
	pbDraw(finalResult) {
		if(finalResult !== "none" && finalResult !== "low pair" && finalResult !== "high card") {
			let divLeft = document.querySelector("#" + stringToCamelCase(finalResult));
			divLeft.classList.add("highlighted", "strong");
			let divRight = document.querySelector("#" + stringToCamelCase(finalResult) + "Payout");
			divRight.classList.add("highlighted", "strong");
		}
	}

	displayCard(i, card) {
		this.updateCardContent(i, card.toString());
		let fontColor = card.isRed() ? "darkred" : "black";
		this.cardDisplays[i-1].setFontColor(fontColor);
	}

	updateLog(roundCount, result) {
		this.logDisplay.addContent("Round " + roundCount + ": " + result + "<br>");
		this.logDisplay.handler.scrollTop = this.logDisplay.handler.scrollHeight;
	}

	updateCardContent(i, newContent) { this.cardDisplays[i-1].replaceContent(newContent); }
	holdCard(i) { this.cardDisplays[i-1].addClass("onHold"); }
	unholdCard(i) { this.cardDisplays[i-1].removeClass("onHold"); }
	enableHoldButton(i) { this.holdButtons[i-1].enable(); }
	disableHoldButton(i) { this.holdButtons[i-1].disable(); }
	pressHoldButton(i) { this.holdButtons[i-1].addClass("pressed"); }
	unpressHoldButton(i) { this.holdButtons[i-1].removeClass("pressed"); } 
	showPayoutBoard() { document.querySelector(".payoutBoard").setAttribute("style", "display:flex"); }
	hidePayoutBoard() { document.querySelector(".payoutBoard").setAttribute("style", "display:none"); }
	showGameOverBoard() { document.querySelector(".gameOver").setAttribute("style", "display:block"); }
	hideGameOverBoard() { document.querySelector(".gameOver").setAttribute("style", "display:none"); }
	clearLog() { document.querySelector(".displayLog").innerHTML = ""; }

}

/* MAIN GAME-----------------------------------------------------------------------------*/
/*---------------------------------------------------------------------------------------*/

class Game {

	screen;
	credit;
	roundCount;
	toHold;

	currentDeck;
	initialHand;
	newHand;
	
	lastResult;
	initialResult;
	newResult;

	payout;

	results;
	payouts;
	

	newGame() {

		this.screen = new Screen();
	
		// establish round count & credit
		this.roundCount = 0;
		this.credit = 10;
		this.payout = 0;
		this.screen.updateRound(this.roundCount);
		this.screen.setCredit(this.credit);
	
		// toggle buttons
		this.screen.newGameButton.disable();
		this.screen.autoGameButton.disable();
		this.screen.autoRoundButton.enable();
		this.screen.dealButton.enable();
	
		// reset card panel
		[1,2,3,4,5].forEach(i => this.screen.updateCardContent(i, " "));
		[1,2,3,4,5].forEach(i => this.screen.unholdCard(i));
		[1,2,3,4,5].forEach(i => this.screen.unpressHoldButton(i));
	
		// clear screen
		this.screen.showPayoutBoard();
		this.screen.hideGameOverBoard();
		this.screen.clearLog();
	
		this.lastResult = "none";
	
	} // END OF newGame()

	deal() {

		// initialize global variables
		this.currentDeck = new Deck();
		this.initialHand = this.currentDeck.dealHand();
		this.toHold = new Set();
	
		// maintain round count and credit
		this.screen.updateRound(++this.roundCount);
		this.screen.setCredit(--this.credit);
	
		// toggle buttons
		this.screen.dealButton.disable();
		this.screen.autoHoldButton.enable();
		this.screen.drawButton.enable();
		this.screen.autoRoundButton.disable();
		[1,2,3,4,5].forEach(i => this.screen.enableHoldButton(i));
		[1,2,3,4,5].forEach(i => this.screen.unpressHoldButton(i));
		[1,2,3,4,5].forEach(i => this.screen.unholdCard(i));
	
		// display each card
		[1,2,3,4,5].forEach(i => this.screen.displayCard(i, this.initialHand.getCard(i)));
	
		// pre-draw outcome of the hand
		this.initialResult = this.initialHand.getOutcome();
		//this.screen.updateResult(this.initialResult);
		this.screen.odDeal(this.initialResult);
	

		// clear payout board
		this.screen.clearPayoutBoard();
		this.screen.pbDeal(this.initialResult);
	
	} // END OF deal()

	hold(i) {

		if(this.toHold.has(i)) {
			this.toHold.delete(i);
			this.screen.unpressHoldButton(i);
			this.screen.unholdCard(i);
		} else {
			this.toHold.add(i);
			this.screen.pressHoldButton(i);
			this.screen.holdCard(i);
		}
	
	} // END OF hold()

	autoHold() {
		this.initialHand.suggestedHolds().forEach(i => this.hold(i));
	}

	draw() {
		this.newHand = new Hand([]);
	
		// toggle buttons
		this.screen.dealButton.enable();
		this.screen.autoHoldButton.disable();
		this.screen.drawButton.disable();
		this.screen.autoRoundButton.enable();
		[1,2,3,4,5].forEach(i => this.screen.disableHoldButton(i));
	
		// create & display new hand
		for(let i=1; i<=5; i++) {
			if(this.toHold.has(i)) {
				this.newHand.addCard(this.initialHand.getCard(i));
			} else { 
				let newCard = this.currentDeck.drawCard();
				this.newHand.addCard(newCard);
				this.screen.displayCard(i, newCard);
			}
		}

		// post-draw outcome of the hand
		this.newResult = this.newHand.getOutcome();
		this.screen.odDraw(this.newResult);
		this.payout = this.newHand.determinePayout(); 
		
		// update credits
		let oldCredit = this.credit;
		this.credit += this.payout;
		let newCredit = this.credit;
		this.screen.updateCredit(oldCredit, newCredit);
		
		// update payout board & outcome display
		this.screen.clearPayoutBoard();
		this.screen.pbDraw(this.newResult);
		//this.screen.odDraw(this.newResult);
	
		// update log
		this.screen.updateLog(this.roundCount, this.newResult);
	
		this.lastResult = this.newResult;
	
		if(this.credit === 0 && this.payout === 0) {
			this.gameOver();
		}
	} // END OF draw()

	gameOver() {
	
		// toggle buttons
		this.screen.newGameButton.enable();
		this.screen.dealButton.disable();
		this.screen.autoRoundButton.disable();
		this.screen.autoGameButton.enable();
	
		// update info board
		this.screen.hidePayoutBoard();
		this.screen.showGameOverBoard();
		this.screen.gameOverDisplay.replaceContent( 
			"<b>GAME OVER</b><br>You survived " + this.roundCount + " rounds" +
			"<br>Remember: The house always wins...");
	
	} // END OF gameOver()

	autoRound() {
		this.deal();

		setTimeout(() => {
			this.autoHold();
		}, 500);

		setTimeout(() => {
			this.draw();
		}, 1000);

	} // END OF autoRound()

	autoGame() {
		this.newGame();
		this.results = [];
		this.payouts = [];
		
		let myId = setInterval(() => {
			if(this.credit !== 0) {
				this.autoRound();
				this.results.push(this.lastResult);
				this.payouts.push(this.payout);
			} else { clearInterval(myId); }
		}, 2000 );

	} // END OF autoGame()

	instaGame() {
		this.newGame();
		this.results = [];
		this.payouts = [];

		while(this.credit !== 0) {
			this.deal();
			this.autoHold();
			this.draw();
			this.results.push(this.lastResult);
			this.payouts.push(this.payout);
		}
	}
}

const myGame = new Game();

