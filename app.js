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

  toString() {
    let result = "";

    switch(this.rank) {
      case 2: result += "Two"; break;
      case 3: result += "Three"; break;
      case 4: result += "Four"; break;
      case 5: result += "Five"; break;
      case 6: result += "Six"; break;
      case 7: result += "Seven"; break;
      case 8: result += "Eight"; break;
      case 9: result += "Nine"; break;
      case 10: result += "Ten"; break;
      case 11: result += "Jack"; break;
      case 12: result += "Queen"; break;
      case 13: result += "King"; break;
      case 14: result += "Ace"; break;
      default: result += "Error"; break;
    }

    result += " ";

    switch(this.suit) {
      case 1: result += "Clubs"; break;
      case 2: result += "Diamonds"; break;
      case 3: result += "Hearts"; break;
      case 4: result += "Spades"; break;
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
    console.log(diffArray);
    return diffArray;
  }

  determineResult() {
    let sortedCards = this.sortByRank();
    let diffArray = this.makeDiffArray();
    let result = "none";

    // if diffArray = [1,1,1,1] -- straight
    if(diffArray.filter((element) => element == 1).length === 4) {
      result = "straight";
    }
    
    // if diffArray contains three 0s -- four of a kind or full house
    if(diffArray.filter((element) => element == 0).length === 3) {

      // if three consecutive 0s -- four of a kind
      if(diffArray[0] != 0 || diffArray[3] != 0) {
        result = "four of a kind"
      } else {
        // if three non-consecutive 0s -- full house
        result = "full house";
      }
    }
    
    // if diffArray contains two 0s -- three of a kind or two pair
    if(diffArray.filter((element) => element == 0).length === 2) {

      // if diffarray contains two consecutive 0s -- three of a kind
      if(diffArray.lastIndexOf(0) - diffArray.indexOf(0) === 1) {
        result = "three of a kind";

        // if diffArray contains two non-consecutive 0s -- two pair
      } else {
        result = "two pair";
      }
    }

    // if diffArray contains one 0 -- pair
    if(diffArray.filter((element) => element == 0).length === 1) {
      result = "one pair";
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
  }

  containsFlush() { // working with ==, not with ===
    let suits = this.cards.map((card) => card.suit);
    return suits.reduce((suit1, suit2) => suit1 == suit2);
  }
}



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

  // QUERY SELECTORS
  const cardDiv1 = document.querySelector("#cardDiv1");
  const cardDiv2 = document.querySelector("#cardDiv2");
  const cardDiv3 = document.querySelector("#cardDiv3");
  const cardDiv4 = document.querySelector("#cardDiv4");
  const cardDiv5 = document.querySelector("#cardDiv5");
  const resultOutput = document.querySelector(".resultOutput");

  let myDeck = new Deck();
  let myHand = new Hand();

  for(let i=1; i<=5; i++) {
    let currentCard = myDeck.draw();
    //let currentCard = new Card(i+1, 1);
    myHand.addCard(currentCard);
  }
  let mySortedHand = myHand.sortByRank();
  for(let i=1; i<=5; i++) {
    
    let currentCard = mySortedHand[i-1];
    //let currentCard = myHand.cards[i-1];
    
    let currentCardDiv = document.querySelector("#cardDiv" + i.toString());
    currentCardDiv.innerHTML = currentCard.toString();
  }

  //myHand.makeDiffArray();
  resultOutput.innerHTML = myHand.determineResult();
  
} // END OF "NEWGAME()"


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