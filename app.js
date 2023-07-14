/* HELPER FUNCTIONS----------------------------------------------------------------------*/
/*---------------------------------------------------------------------------------------*/
function getRandomInt(min, max) { // taken from MDN
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1) + min); 
}
/*---------------------------------------------------------------------------------------*/
function stringToCamelCase(str) {
	let array = str.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1));
	array[0] = array[0].toLowerCase();
	let camelCase = array.reduce((str1, str2) => str1 + str2);
	return camelCase;
} 
/*---------------------------------------------------------------------------------------*/



/* CLASSES-------------------------------------------------------------------------------*/
/*---------------------------------------------------------------------------------------*/
class Card {
	rank; // int between 2 and 14 (... 10, jacks, queen, king, ace)
	suit; // int between 1 and 4 (clubs, diamonds, hearts, spades)

	constructor(rank, suit) {
		this.rank = rank;
		this.suit = suit;
	}

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

} 
/*---------------------------------------------------------------------------------------*/
class Hand {
	cards;	// array of (usually 5) cards
	ranks;	// array of corresponding ranks, r e {2,...,14}
	suits;	// array of corresponding suits, s e {1,...,4}

	holdsPostSorting;
	holds;

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

		// CASE 2: flush 
		if(this.containsFlush()) { 
			this.holdsPostSorting = [1,2,3,4,5];
			return "flush";
		}

		// CASE 3A - 3C: outcome involves multiples (Q, H, T, PP, HP. LP)
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

	/*** helper function for determining outcome */
	/*** returns the array of "steps" through the sorted rank array */
	deltaArray() {
		let sortedRanks = this.sortByRank().getRankArray();
		let deltaArray = [];
		[1,2,3,4].forEach(i =>
			deltaArray.push(sortedRanks[i] - sortedRanks[i-1]));
		return deltaArray;
	}

	/*** helper function for determining outcome */
	containsFlush() {
		return this.suits.map(suit => suit === this.suits[0]).
							reduce((p,q) => p && q);
	}

	suggestedHolds() { // TODO
		let sortedCards = this.sortByRank().cards;
		this.holds = this.holdsPostSorting.map(i => this.cards.indexOf(sortedCards[i-1]) + 1);
		return this.holds;
	}

	
}
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

}
/*---------------------------------------------------------------------------------------*/
class Element {
	selector;
	element;
	
	constructor(selector) {
		this.selector = selector;
		this.element = document.querySelector(this.selector); 
	}

	addClass(className) { this.element.classList.add(className); return this; }
	removeClass(className) { this.element.classList.remove(className); return this; }
	replaceClass(class1, class2) { this.addClass(class2).removeClass(class1); }
	hide() { this.addClass("hidden"); }
	show() { this.removeClass("hidden"); }
	clear() { this.element.innerHTML = ""; }
}
/*---------------------------------------------------------------------------------------*/
class Button extends Element {
	constructor(selector) { super(selector); }

	enable() { this.element.removeAttribute("disabled"); }
	disable() { this.element.setAttribute("disabled", true); }
} 
/*---------------------------------------------------------------------------------------*/
class ActionButton extends Button {

}
/*---------------------------------------------------------------------------------------*/
class HoldButton extends Button {

	press() { this.addClass("pressed"); }
	unpress() { this.removeClass("pressed"); }
	isPressed() { return this.element.classList.contains("pressed"); }
}
/*---------------------------------------------------------------------------------------*/
class Display extends Element {
	constructor(selector) { super(selector); }

	update(content, fontColor, state) {
		this.replaceContent(content);
		this.setFontColor(fontColor);
		switch(state) {
			case "deal": this.replaceClass("draw", "deal"); break;
			case "draw": this.replaceClass("deal", "draw"); break;
			default: break;
		}
	}

	addContent(content) { this.element.innerHTML += content; }
	replaceContent(content) { this.element.innerHTML = content; }
	setFontColor(newColor) { this.element.style.color = newColor; }
	clear() { this.element.innerHTML = " "; }
} 
/*---------------------------------------------------------------------------------------*/
class CardDisplay extends Display {
	slotID; // int in {1,...,5}

	constructor(selector, slotID) { 
		super(selector);
		this.slotID = slotID;
	}

	update(content, fontColor, state) {
		this.replaceContent(content);
		this.setFontColor(fontColor);
	}

	press() { this.addClass("onHold"); }
	unpress() { this.removeClass("onHold"); }
}
/*---------------------------------------------------------------------------------------*/
class DisplayList extends Element {
	constructor(selector) { super(selector); }

	makeRow(className, idName) {
		let rowElement = document.createElement("div");
		rowElement.setAttribute("class", className);
		rowElement.setAttribute("id", idName);
		return rowElement;
	}

	addElement(newElement) { this.element.appendChild(newElement); }
	enableScroll() { this.element.scrollTop = this.element.scrollHeight; }
}
/*---------------------------------------------------------------------------------------*/
class Log extends DisplayList {
	constructor(selector) { super(selector); }

	update(rowElement, content, fontColor, state) { 
		this.addElement(rowElement);
		let rowDisplay = new Display("#" + rowElement.getAttribute("id"));
		rowDisplay.update(content, fontColor, state);
	}
}
/*---------------------------------------------------------------------------------------*/
class Container extends Element {

}
/*---------------------------------------------------------------------------------------*/
class Paytable extends DisplayList {  }
/*---------------------------------------------------------------------------------------*/
class Screen {
	mode;

	constructor(mode) { this.mode = mode; }

	// CONTAINERS
	topContainer = new Container(".topContainer");
	bottomContainer = new Container(".bottomContainer");

	// DISPLAYS
	creditDisplay = new Display(".display.credit");
	roundDisplay = new Display(".display.round");
	outcomeDisplay = new Display(".display.outcome");
	cardDisplays = [1,2,3,4,5].map(i => new CardDisplay("#cardDisplay" + i, i));
	log = new Log(".displayLog");
	stats = new DisplayList(".stats");
	statsDisplay = new Element(".statsDiv");
// ----------------------------------------------------
	gameOverDisplay = new Display(".gameOver");
	welcomeDisplay = new Display(".welcome");
	payboard = new DisplayList(".payoutBoard");
	cardPanel = new Element(".cardPanel");

	// BUTTONS
	newGameButton = new Button(".actionButton.newGame");
	exitButton = new Button(".actionButton.exit");
	dealButton = new Button(".actionButton.deal");
	drawButton = new Button(".actionButton.draw");
	speedGameButton = new Button(".actionButton.speedGame");
	instaGameButton = new Button(".actionButton.instaGame");
	holdButtons = [1,2,3,4,5].map(i => new HoldButton("#holdButton" + i));

	// COLORS
	winningColor ="lightgreen";
	losingColor = "whitesmoke";


/* STATES *************************************************************************************/

	newGameState() {

		// top container
		this.welcomeDisplay.hide();
		this.gameOverDisplay.hide();
		this.payboard.show();
		this.log.show();
		this.log.clear();
		this.clearPayoutBoard(); // TODO

		this.creditDisplay.update("Credit: 10", "white", "n/a");
		this.roundDisplay.update("Round 0", "white", "n/a"); 
		this.outcomeDisplay.clear();

		// toggle buttons
		this.newGameButton.hide();
		this.exitButton.show();
		this.dealButton.enable();
		this.speedGameButton.disable();
		this.instaGameButton.disable();
		this.mode === "standard" ? this.dealButton.enable() : 
									this.dealButton.disable();

		// bottom container
		if(this.mode === "insta") {
			this.cardPanel.hide();
			this.statsDisplay.show();
		} else {
			this.statsDisplay.hide();
			this.cardPanel.show();
			this.cardDisplays.forEach(cd => cd.clear());
			this.holdButtons.forEach(hb => hb.unpress());
		}
	}

	dealState(roundCount, credit, hand, outcome) {
		let fontColor = Game.winningOutcomes.includes(outcome) ? this.winningColor : this.losingColor;

		// top container
		this.creditDisplay.update("Credit: " + credit, "white", "deal");
		this.roundDisplay.update("Round " + roundCount, "white", "any");
		this.outcomeDisplay.update(outcome.toUpperCase(), fontColor, "deal");
		this.updatePayboard(outcome, "deal");
	
		// toggle buttons
		if(this.mode === "standard") {
			this.dealButton.disable();
			this.drawButton.enable();
		}

		// bottom container
			this.holdButtons.forEach(hb => { hb.enable(); hb.unpress(); });
			this.cardDisplays.forEach(cd => cd.unpress());
			this.cardDisplays.forEach(cd => {
				let cardColor = (hand.getCard(cd.slotID)).isRed() ? "darkred" : "black";
				cd.update(hand.getCard(cd.slotID).toString(), cardColor, "any");
			})
	} 

	drawState(roundCount, hand, outcome, credit, payout) {
		let fontColor = payout > 0 ? this.winningColor : this.losingColor;

		// top container
		let content = (this.mode === "speed" ? `Credit: ${credit+payout}` :
									`Credit: ${credit+payout}   (+${payout})`);
		this.creditDisplay.update(content, fontColor, "draw");
		this.outcomeDisplay.update(outcome.toUpperCase(), fontColor, "draw");
		this.updatePayboard(outcome, "draw");

		// update log
		let rowElement = this.log.makeRow("displayLogRow", "row" + roundCount);
		this.log.update(rowElement, `Round ${roundCount}: ${outcome}<br>`,
						fontColor, "draw");
		this.log.enableScroll();

		// toggle buttons
		if(this.mode === "standard") {
			this.dealButton.enable();
			this.drawButton.disable();
		}
		
		// bottom container
		if(this.mode !== "insta") {
			this.holdButtons.forEach(hb => hb.disable());
			this.cardDisplays.forEach(cd => {
				let cardColor = hand.getCard(cd.slotID).isRed() ? "darkred" : "black";
				cd.update(hand.getCard(cd.slotID).toString(), cardColor, "any");
			})
		}
	} 

	gameOverState(roundCount) {
		this.payboard.hide();
		
		this.gameOverDisplay.show();
		this.gameOverDisplay.replaceContent( 
			"<b>GAME OVER</b><br>You survived " + roundCount + " rounds" +
			"<br>Remember: The house always wins...");

		// toggle buttons
		this.newGameButton.show();
		this.exitButton.hide();
		this.dealButton.disable();
		this.drawButton.disable();
		this.speedGameButton.enable();
		this.instaGameButton.enable();
		
		this.statsDisplay.show();
	}


/* METHODS *************************************************************************************/


	getHolds() {
		return new Set([1,2,3,4,5].filter(i => this.holdButtons[i-1].isPressed()));
	}

	// strip previous highlighting from payout board
	clearPayoutBoard() {
	document.querySelectorAll(".payoutElement")
			.forEach(element => element.classList.remove("highlighted", "deal", "draw"));
	}

	updatePayboard(outcome, state) {
		this.clearPayoutBoard();
		
		// highlight row according to outcome
		if(Game.winningOutcomes.includes(outcome)) {
			let divLeft = document.querySelector("#" + stringToCamelCase(outcome));
			divLeft.classList.add("highlighted", state);
			let divRight = document.querySelector("#" + stringToCamelCase(outcome) + "Payout");
			divRight.classList.add("highlighted", state);
		}
	}
}

/* MAIN GAME-----------------------------------------------------------------------------*/
/*---------------------------------------------------------------------------------------*/

class Game {

	screen;
	exitFlag;

	roundCount;
	toHold;

	credit;
	currentDeck;
	initHand;
	finalHand;
	
	initOutcome;
	finalOutcome;
	outcomes;

	credits;

	static winningOutcomes = ["royal flush", "straight flush", "four of a kind", "full house",
				"flush", "straight", "three of a kind", "two pair", "jacks or better"];
	

	newGame(mode) {
		this.screen = new Screen(mode);
		this.credits = [];
		this.outcomes = [];

		this.roundCount = 0;
		this.credit = 10;
		this.credits.push(this.credit);
		this.outcomes.push("n/a");
		this.screen.newGameState();
		this.exitFlag = false;
	}

	deal() {
		this.currentDeck = new Deck();
		this.initHand = this.currentDeck.dealHand();
		this.toHold = new Set();
	
		this.roundCount++;
		this.credit--;
	
		this.initOutcome = this.initHand.getOutcome();
		this.screen.dealState(this.roundCount, this.credit, this.initHand, this.initOutcome);

		// auto hold
		if(document.querySelector("#cbAutoHold").checked) {
			this.initHand.suggestedHolds().forEach(i => this.hold(i));
		}
	} 

	hold(i) {
		if(this.toHold.has(i)) {
			this.toHold.delete(i);
			this.screen.holdButtons[i-1].unpress();
			this.screen.cardDisplays[i-1].unpress();
			
		} else {
			this.toHold.add(i);
			this.screen.holdButtons[i-1].press();
			this.screen.cardDisplays[i-1].press();
		}
	} 

	draw() {
		let holds = this.screen.getHolds();
	
		// create new hand
		this.finalHand = new Hand([]);
		for(let i=1; i<=5; i++) {
			if(holds.has(i)) {
				this.finalHand.addCard(this.initHand.getCard(i));
			} else { this.finalHand.addCard(this.currentDeck.drawCard()); }
		}

		// post-draw outcome of the hand
		this.finalOutcome = this.finalHand.getOutcome();
		this.outcomes.push(this.finalOutcome);
		let payout = this.finalHand.getPayout(); 
		
		this.screen.drawState(this.roundCount, this.finalHand, this.finalOutcome, 
			this.credit, payout);
			
		this.credit += payout;
		this.credits.push(this.credit);

		if(this.exitFlag) { this.credit = 0; payout = 0; } // TODO
		if(this.credit === 0 && payout === 0) { this.gameOver(); } // TODO
	}

	exit() {
		this.exitFlag = true;
		this.screen.exitButton.hide();
		this.screen.newGameButton.show();
		this.gameOver();
	}

	gameOver() {
		let creditString = this.credits.map(credit => "<br>" + "*".repeat(credit))
										.reduce((a,b) => a+b);
		document.querySelector(".stats").innerHTML = creditString;
		this.screen.gameOverState(this.roundCount);
	} 

	autoRound(m,n) {
		setTimeout(() => {this.deal();}, m);
		setTimeout(() => {this.draw();}, n);
	} 

	speedGame() {
		this.screen = new Screen("speed");
		this.newGame("speed");
		let myId = setInterval(() => {
			if(this.credit !== 0) {
				this.autoRound(0,50);
			} else { clearInterval(myId); }
		}, 100 );
	}

	instaGame() {
		this.screen = new Screen("insta");
		this.newGame("insta");
		while(this.credit !== 0) {
			this.deal();
			this.draw();
		} 

		/* let myId = setInterval(() => {
			if(this.credit !== 0) {
				this.autoRound(0,10);
			} else { clearInterval(myId); }
		}, 20 ); */
	}
}

const myGame = new Game();
