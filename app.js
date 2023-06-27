function getRandomInt(min, max) { // taken from MDN
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); 
}



class Card {
  rank = 0; // int between 2 and 14 (... 10, jacks, queen, king, ace)
  suit = 0; // int between 1 and 4 (clubs, diamonds, hearts, spades)

  constructor(rank, suit) {
    this.rank = rank;
    this.suit = suit;
  }

  isRed() {
    return (this.suit === 2 || this.suit === 3);
  }

  toString() {
    let result = "";

    switch(this.rank) {
      case 2: result += "2"; break;
      case 3: result += "3"; break;
      case 4: result += "4"; break;
      case 5: result += "5"; break;
      case 6: result += "6"; break;
      case 7: result += "7"; break;
      case 8: result += "8"; break;
      case 9: result += "9"; break;
      case 10: result += "10"; break;
      case 11: result += "J"; break;
      case 12: result += "Q"; break;
      case 13: result += "K"; break;
      case 14: result += "A"; break;
      default: result += "Error"; break;
    }

    switch(this.suit) {
      case 1: result += "&clubsuit;"; break;
      case 2: result += "&diamondsuit;"; break;
      case 3: result += "&heartsuit;"; break;
      case 4: result += "&spadesuit;"; break;
      default: result += "Error"; break;
    }

    return result;

  } // END OF METHOD "TOSTRING()"
} // END OF CLASS "CARD"



class Hand {
  cards = [];

  addCard(card) {
    this.cards.push(card);
  }

  sortByRank() { // does not mutate original array 'cards'
    let sortedCards = [...this.cards];
    sortedCards.sort((card1, card2) => card1.rank - card2.rank);
    return sortedCards;
  }

  makeDiffArray() {
    let sortedCards = this.sortByRank();
    let diffArray = [];
    for(let i=0; i<4; i++) {
      diffArray.push(sortedCards[i+1].rank - sortedCards[i].rank);
    }
    return diffArray;
  }

  containsFlush() { // working with ==, not with ===
    let suits = this.cards.map((card) => card.suit);
    return suits.reduce((suit1, suit2) => suit1 == suit2);
  }

  determineResult() {
    let sortedCards = this.sortByRank();
    let diffArray = this.makeDiffArray();
    let result = "none";

    const numberOfOnes = diffArray.filter((element) => element == 1).length;
    const numberOfZeros = diffArray.filter((element) => element == 0).length;

    if(numberOfOnes === 4) { result = "straight"; }
    
    switch(numberOfZeros) {
      case 3:
        if(diffArray[0] != 0 || diffArray[3] != 0) { 
          result = "four of a kind"; // three consecutive 0s
        } else { result = "full house"; } // three non-consecutive 0s
        break;
      case 2: 
        if(diffArray.lastIndexOf(0) - diffArray.indexOf(0) === 1) {
          result = "three of a kind"; // two consecutive 0s
        } else { result = "two pair"; } // two non-consecutive 0s
        break;
      case 1: result = "one pair"; break; // singular 0
    }

    // check for straight flush
    if(this.containsFlush()) {
      switch(result) {
        case "straight": result += " flush"; break;
        default: result = "flush"; break;
      }
    }

    // check for royal flush
    if(result === "straight flush") {
      if(sortedCards[4].rank === 14) {
        result = "royal flush";
      }
    }
  
    return result;

  } // END OF METHOD 'DETERMINERESULT'
} // END OF CLASS 'HAND'



class Deck {
  cards = [];

  constructor() {
    for(let suit = 1; suit <= 4; suit++) {
      for(let rank = 2; rank <= 14; rank++) {
        this.cards.push(new Card(rank, suit));
      }
    }
  }

  draw() {
    let randomInt = getRandomInt(1, this.cards.length);
    let randomCard = this.cards[randomInt-1];
    this.cards.splice(randomInt-1, 1)
    return randomCard;
  }

} // END OF CLASS "DECK"




const newGame = () => {
  newHand();
}

const newHand = () => {
  
  let myDeck = new Deck();
  let myHand = new Hand();

  for(let i=1; i<=5; i++) {
    let currentCard = myDeck.draw();
    myHand.addCard(currentCard);
  }
  let mySortedHand = myHand.sortByRank();
  for(let i=1; i<=5; i++) {
    let currentCard = mySortedHand[i-1];
    let currentCardArea;
    let altCardArea;
    
    if(currentCard.isRed()) {
      currentCardArea = document.querySelector("#cardArea" + i.toString() + "R");
      altCardArea = document.querySelector("#cardArea" + i.toString())
    } else {
      currentCardArea = document.querySelector("#cardArea" + i.toString());
      altCardArea = document.querySelector("#cardArea" + i.toString() + "R");
    }
    currentCardArea.setAttribute("style", "display:block");
    altCardArea.setAttribute("style", "display:none");
    currentCardArea.innerHTML = currentCard.toString();
  }

  const resultOutput = document.querySelector(".resultOutput");
  resultOutput.innerHTML = myHand.determineResult().toUpperCase();
  
} // END OF "NEW HAND()"


// STEP 1
// let player pick which cards to hold, confirm w/ button click

// STEP 2
// remove non-held cards from player's hand

// STEP 3
// draw (& remove) corresponding number of cards from deck

// STEP 4
// replace player's non-held cards

// STEP 5
// determine outcome of hand

// STEP 6
// add credits according to outcome