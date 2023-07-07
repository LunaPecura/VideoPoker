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

	#holdsPostSorting;
	#holds;

	constructor(cardArray) {
		this.cards = [...cardArray];
		this.ranks = this.cards.map(card => card.getRankID());
		this.suits = this.cards.map(card => card.getSuitID());
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

	/*** returns a new hand with the cards sorted according to their rank */
	sortByRank() { 
		let cardsCopy = this.getCardArray(); // don't mutate original 'cards' array!
		let sortedCards = cardsCopy.sort((c1,c2) => c1.getRankID()-c2.getRankID());
		return new Hand(sortedCards);
	} 

	/*** returns the outcome of the hand as a string */
	getOutcome() {
		let sortedCards = this.sortByRank().cards;
		let deltas = this.deltaArray();

		// CASE 1: outcome in the 'straight' family (RF, SF, S)
		let delta1 = deltas.map(d => (d===1) ? "1" : "x").reduce((s1,s2) => s1+s2);
		if(delta1 === "1111") {  // check for straight
			this.holdsPostSorting = [1,2,3,4,5];
			if(this.containsFlush()) { // check for straight flush
				if(sortedCards[4].isAce()) { // check for royal flush
					return "royal flush"; }
				else { return "straight flush"; } 
			} else { return "straight"; } 
		} 

		// CASE 2A - 2C: result involves multiples (Q, H, T, PP, HP. LP)
		let delta0 = deltas.map(d => (d===0) ? "0" : "x").reduce((s1,s2) => s1+s2);
		switch(delta0) { 
			case "x000": this.holdsPostSorting = [2,3,4,5]; return "four of a kind";
			case "000x": this.holdsPostSorting = [1,2,3,4]; return "four of a kind";
			case "0x00": this.holdsPostSorting = [1,2,3,4,5]; return "full house";
			case "00x0": this.holdsPostSorting = [1,2,3,4,5]; return "full house";
			case "00xx": this.holdsPostSorting = [1,2,3]; return "three of a kind";
			case "x00x": this.holdsPostSorting = [2,3,4]; return "three of a kind";
			case "xx00": this.holdsPostSorting = [3,4,5]; return "three of a kind"; 
			case "0xx0": this.holdsPostSorting = [1,2,4,5]; return "two pair";
			case "0x0x": this.holdsPostSorting = [1,2,3,4]; return "two pair"; 
			case "x0x0": this.holdsPostSorting = [2,3,4,5]; return "two pair";
			case "0xxx": this.holdsPostSorting = [1,2];
				return (sortedCards[1].isHighCard()) ? "jacks or better" : "low pair";
			case "x0xx": this.holdsPostSorting = [2,3];
				return (sortedCards[2].isHighCard()) ? "jacks or better" : "low pair";
			case "xx0x": this.holdsPostSorting = [3,4];
				return (sortedCards[3].isHighCard()) ? "jacks or better" : "low pair";
			case "xxx0": this.holdsPostSorting = [4,5];
				return (sortedCards[4].isHighCard()) ? "jacks or better" : "low pair";
			case "xxxx": this.holdsPostSorting = [1,2,3,4,5].filter(i => sortedCards[i-1].isHighCard());
				return this.holdsPostSorting.length > 0 ? "high card" : "none";
		}

		// CASE 3: check for flush 
		if(this.containsFlush()) { 
			this.holdsPostSorting = [1,2,3,4,5];
			return "flush";
		}

		// CASE 4: not a paying outcome
		return "none";

	} // END OF getOutcome()

	getPayout() {
		let outcome = this.getOutcome();
		switch(outcome) {
			case "royal flush": return 250; 
			case "straight flush": return 50; 
			case "four of a kind": return 25;
			case "full house": return 9;
			case "flush": return 6;
			case "straight": return 4;
			case "three of a kind": return 3;
			case "two pair": return 2;
			case "jacks or better": return 1;
			case "low pair": return 0;
			case "none": return 0;
			default: return 0; 
		}
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

	suggestedHolds() { // TODO
		let sortedCards = this.sortByRank().cards;
		this.holds = this.holdsPostSorting.map(i => this.cards.indexOf(sortedCards[i-1]) + 1);
		return this.holds;
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

	drawCard() {
		let randomInt = getRandomInt(1, this.currentSize());
		let randomCard = this.cards[randomInt-1];
		this.cards.splice(randomInt-1, 1);
		return randomCard;
	}

	dealHand() { return new Hand([1,2,3,4,5].map(i => this.drawCard())); }
	currentSize() { return this.cards.length; }


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
	hide() { this.addClass("hidden"); }
	show() { this.removeClass("hidden"); }
	addContent(content) { this.handler.innerHTML += content; }
	replaceContent(content) { this.handler.innerHTML = content; }
	setFontColor(newColor) { (this.handler).style.color = newColor; }
	addClass(className) { this.handler.classList.add(className); return this;}
	removeClass(className) { this.handler.classList.remove(className); return this; }
	replaceClass(class1, class2) { this.addClass(class2).removeClass(class1); }
	enableScroll() { this.handler.scrollTop = this.handler.scrollHeight; }

} // END OF CLASS "DisplayHandler"
/*---------------------------------------------------------------------------------------*/
class Screen {

	// DISPLAY HANDLERS
	creditDisplay = new DisplayHandler(".display.credit");  
	outcomeDisplay = new DisplayHandler(".display.result"); 
	roundDisplay = new DisplayHandler(".display.round");
	infoBoardDisplay = new DisplayHandler(".infoBoard");
	payoutBoardDisplay = new DisplayHandler(".payoutBoard");
	logDisplay = new DisplayHandler(".displayLog");
	cardDisplays = [1,2,3,4,5].map(i => new DisplayHandler("#cardArea" + i));
	welcomeDisplay = new DisplayHandler(".welcome");
	gameOverDisplay = new DisplayHandler(".gameOver");

	// BUTTON HANDLERS
	newGameButton = new ButtonHandler(".actionButton.newGame");
	dealButton = new ButtonHandler(".actionButton.deal");
	drawButton = new ButtonHandler(".actionButton.draw");
	holdButtons = [1,2,3,4,5].map(i => new ButtonHandler("#holdButton" + i));
	autoHoldButton = new ButtonHandler(".actionButton.autoHold");
	autoRoundButton = new ButtonHandler(".actionButton.autoRound");
	autoGameButton = new ButtonHandler(".actionButton.autoGame");

	// COLORS
	winningColor ="lightgreen";
	losingColor = "lightcoral";



/* METHODS *************************************************************************************/

	showPayoutBoard() { this.payoutBoardDisplay.show(); }
	hidePayoutBoard() { this.payoutBoardDisplay.hide(); }
	showGameOverBoard() { this.gameOverDisplay.show(); }
	hideGameOverBoard() { this.gameOverDisplay.hide(); }
	showInfoBoard() { this.infoBoardDisplay.show(); }
	hideInfoBoard() { this.infoBoardDisplay.hide(); }
	showWelcomeBoard() {this.welcomeDisplay.show(); }
	hideWelcomeBoard() {this.welcomeDisplay.hide(); }


	// update round display to post-deal state
	roundDisplayUpdate(roundCount) { 
		let newContent = "Round " + roundCount;
		this.roundDisplay.replaceContent(newContent); 
	}

	// update credit display to post-deal state
	creditDisplayDeal(newCredit) {
		let newContent = "Credit: " + newCredit;
		this.creditDisplay.replaceContent(newContent);
		this.creditDisplay.setFontColor("white");
		this.creditDisplay.replaceClass("draw", "deal"); 
	}

	// update credit display to post-draw state
	creditDisplayDraw(oldCredit, newCredit) {
		let payout = newCredit - oldCredit;
		let newContent = "Credit: " + newCredit + "   (+" + payout + ")";
		let fontColor = (payout > 0) ? this.winningColor : this.losingColor;
		this.creditDisplay.replaceContent(newContent);
		this.creditDisplay.setFontColor(fontColor);
		this.creditDisplay.replaceClass("deal", "draw");
	}

	// update outcome display to any state (private helper method)
	#outcomeDisplayUpdate = (result) => {
		let newContent = result.toUpperCase();
		let winning = Game.winningOutcomes.includes(result);
		let fontColor = winning ? this.winningColor : this.losingColor;
		this.outcomeDisplay.replaceContent(newContent);
		this.outcomeDisplay.setFontColor(fontColor);
	}

	// update outcome display to post-deal state
	outcomeDisplayDeal(initialResult) {
		this.#outcomeDisplayUpdate(initialResult);
		this.outcomeDisplay.replaceClass("draw", "deal");
	}

	// update outcome display to post-draw state
	outcomeDisplayDraw(finalResult) {
		this.#outcomeDisplayUpdate(finalResult);
		this.outcomeDisplay.replaceClass("deal", "draw");
	}

	// remove highlighted rows on payout board
	payoutBoardClear() {
		document.querySelectorAll(".payoutElement")
				.forEach(element => element.classList.remove("highlighted", "deal", "draw"));
	}

	// update the payboard to post-deal state: highlight potential winning row
	payoutBoardDeal(initialResult) {
		if(Game.winningOutcomes.includes(initialResult)) {
			let divLeft = document.querySelector("#" + stringToCamelCase(initialResult));
			divLeft.classList.add("highlighted", "deal");
			let divRight = document.querySelector("#" + stringToCamelCase(initialResult) + "Payout");
			divRight.classList.add("highlighted", "deal");
		}
	}

	// update the payboard to post-draw state
	payoutBoardDraw(finalResult) {
		if(Game.winningOutcomes.includes(finalResult)) {
			let divLeft = document.querySelector("#" + stringToCamelCase(finalResult));
			divLeft.classList.add("highlighted", "draw");
			let divRight = document.querySelector("#" + stringToCamelCase(finalResult) + "Payout");
			divRight.classList.add("highlighted", "draw");
		}
	}

	displayCard(i, card) {
		this.cardDisplays[i-1].replaceContent(card.toString());
		let fontColor = card.isRed() ? "darkred" : "black";
		this.cardDisplays[i-1].setFontColor(fontColor);
	}

	cardDisplaysClear() {
		[1,2,3,4,5].forEach(i => this.cardDisplays[i-1].replaceContent(" "));
	}

	updateLog(roundCount, result) { 
		let newRow = document.createElement("div");
		newRow.setAttribute("class", "displayLogRow");
		newRow.setAttribute("id", "row" + roundCount);
		(this.logDisplay.handler).appendChild(newRow);

		let rowDisplay = new DisplayHandler("#row" + roundCount);
		let content = "Round " + roundCount + ": " + result + "<br>";
		let winning = Game.winningOutcomes.includes(result);
		let fontColor = winning ? this.winningColor : this.losingColor;
		rowDisplay.addContent(content);
		rowDisplay.setFontColor(fontColor);
		this.logDisplay.enableScroll();
	}

	holdCard(i) { this.cardDisplays[i-1].addClass("onHold"); }
	unholdCard(i) { this.cardDisplays[i-1].removeClass("onHold"); }
	enableHoldButton(i) { this.holdButtons[i-1].enable(); }
	disableHoldButton(i) { this.holdButtons[i-1].disable(); }
	pressHoldButton(i) { this.holdButtons[i-1].addClass("pressed"); }
	unpressHoldButton(i) { this.holdButtons[i-1].removeClass("pressed"); } 
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

	static winningOutcomes = ["royal flush", "straight flush", "four of a kind", "full house",
				"flush", "straight", "three of a kind", "two pair", "jacks or better"];
	

	newGame() {

		this.screen = new Screen();
	
		// establish round count & credit
		this.roundCount = 0;
		this.credit = 10;
		this.payout = 0;
		this.screen.roundDisplayUpdate(this.roundCount);
	
		// toggle buttons
		this.screen.newGameButton.disable();
		this.screen.autoGameButton.disable();
		this.screen.autoRoundButton.enable();
		this.screen.dealButton.enable();
	
		// reset card panel
		this.screen.cardDisplaysClear();
		[1,2,3,4,5].forEach(i => this.screen.unholdCard(i));
		[1,2,3,4,5].forEach(i => this.screen.unpressHoldButton(i));
	
		// clear screen
		this.screen.hideGameOverBoard();
		this.screen.hideWelcomeBoard();
		this.screen.showInfoBoard();
		this.screen.clearLog();
	
		this.lastResult = "none";
	
	} // END OF newGame()

	deal() {

		// initialize global variables
		this.currentDeck = new Deck();
		this.initialHand = this.currentDeck.dealHand();
		this.toHold = new Set();
	
		// maintain round count and credit
		this.screen.roundDisplayUpdate(++this.roundCount);
		this.screen.creditDisplayDeal(--this.credit);
	
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

		// update payout board & outcome display
		this.screen.payoutBoardClear();
		this.screen.payoutBoardDeal(this.initialResult);
		this.screen.outcomeDisplayDeal(this.initialResult);
	
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
		this.screen.outcomeDisplayDraw(this.newResult);
		this.payout = this.newHand.getPayout(); 
		
		// update credits
		let oldCredit = this.credit;
		this.credit += this.payout;
		let newCredit = this.credit;

		// update payout board & outcome display
		this.screen.payoutBoardClear();
		this.screen.payoutBoardDraw(this.newResult);
		this.screen.creditDisplayDraw(oldCredit, newCredit);
	
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

