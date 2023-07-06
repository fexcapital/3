import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

export const StyledButton = styled.button`
  padding: 10px;
  border-radius: 25px;
  border: var(--primary);
  background-color: var(--primary);
  padding: 10px;
  font-weight: bold;
  font-size: 20px;
  color: var(--accent);
  width: 150px;
  height: 75px;
  cursor: pointer;
  box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;




export const StyledRoundButton = styled.button`
  padding: 10px;
  border-radius: 100%;
  border: none;
  background-color: var(--primary);
  padding: 10px;
  font-weight: bold;
  font-size: 25px;
  color: var(--accent);
  width: 50px;
  height: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const ResponsiveWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: stretched;
  align-items: stretched;
  width: 100%;
  @media (min-width: 767px) {
    flex-direction: row;
  }
`;

export const StyledLogo = styled.img`
  width: 200px;
  @media (min-width: 767px) {
    width: 300px;
  }
  transition: width 0.5s;
  transition: height 0.5s;
`;

export const StyledImg = styled.img`
  box-shadow: 0px 5px 11px 2px rgba(0, 0, 0, 0.7);
  border: 4px dashed var(--secondary);
  background-color: var(--accent);
  border-radius: 100%;
  width: 200px;
  @media (min-width: 900px) {
    width: 250px;
  }
  @media (min-width: 1000px) {
    width: 300px;
  }
  transition: width 0.5s;
`;

export const StyledLink = styled.a`
  color: var(--secondary);
  text-decoration: none;
`;

function App() {
  const dispatch = useDispatch();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const endTime = new Date("2023-06-10T06:32:30Z");
  const initialTimeRemaining = endTime - new Date();
  const [mintOpen, setMintOpen] = useState(initialTimeRemaining <= 1000);
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(`Click to mint your Ordi Gals.`);
  const [mintAmount, setMintAmount] = useState(1);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
  });

  const claimNFTs = () => {
    let cost = CONFIG.WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(130000);
    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
    setClaimingNft(true);
    blockchain.smartContract.methods
      .mint(mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `WOW, the ${CONFIG.NFT_NAME} is yours! go visit Opensea.io to view it.`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 5) {
      newMintAmount = 5;
    }
    setMintAmount(newMintAmount);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);

  useEffect(() => {
    const updateTimeRemaining = () => {
      const now = new Date();
      const timeElapsed = endTime - now;
      const secondsElapsed = Math.floor(timeElapsed / 1000);

      if (timeElapsed <= 1000) {
        setMintOpen(true);
        clearInterval(interval);
      } else {
        setElapsedSeconds(secondsElapsed);
      }
    };

    const interval = setInterval(() => {
      updateTimeRemaining();
    }, 1000);

    updateTimeRemaining();

    return () => clearInterval(interval);
  }, []);


  return (
    <s.Screen>
      <s.Container
        flex={1}
        jc={"center"}
        ai={"center"}
        style={{ padding: 100, backgroundColor: "var(--primary)" }}
        image={CONFIG.SHOW_BACKGROUND ? "/config/images/bg.png" : null}
      >




        <s.SpacerSmall />
        <ResponsiveWrapper flex={1} style={{ padding: 24 }} test>

          <s.SpacerLarge />
          <s.Container
            flex={2}
            jc={"center"}
            ai={"center"}
            style={{
              //backgroundColor: "var(--accent)",
              padding: 20, //24
              //borderRadius: 30, //24
              //border: "4px dashed var(--secondary)",
              //boxShadow: "0px 5px 11px 2px rgba(0,0,0,0.7)",
              opacity: 1
            }}
          //image={CONFIG.SHOW_BACKGROUND ? "/config/images/bg.png" : null}

          >

            <s.TextDescription
              style={{
                textAlign: "center",
                fontSize: 150,
                fontWeight: "bold",
                color: "var(--primary)",
              }}
            >
              Ordi Gals
            </s.TextDescription>
            <s.SpacerLarge />
            <s.TextDescription
              style={{
                textAlign: "center",
                fontSize: 40,
                //fontWeight: "bold",
                color: "var(--primary)",
              }}
            >
              Public Mint June 10, 12:00 UTC
            </s.TextDescription>
            <s.SpacerLarge />




            <s.TextDescription
              style={{
                textAlign: "center",
                fontSize: 40,
                color: "var(--primary)",
              }}
            >
              {mintOpen
                ? "MINT OPEN"
                : new Date(elapsedSeconds * 1000).toLocaleString("en-GB", {
                  hour: "numeric",
                  minute: "numeric",
                  second: "numeric",
                  timeZone: "UTC",
                })}
            </s.TextDescription>





            <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: 40,
                //fontWeight: "bold",
                color: "var(--primary)",
              }}
            >
              MAX SUPPLY: {CONFIG.MAX_SUPPLY}
            </s.TextTitle>


            <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: 40,
                //fontWeight: "bold",
                color: "var(--primary)",
              }}
            >
              Ordi Gals MINTED: {data.totalSupply}
            </s.TextTitle>


            <s.TextTitle
              style={{ textAlign: "center", color: "var(--primary)", fontSize: 40 }}
            >
              Price: {CONFIG.DISPLAY_COST}{" "}
              {CONFIG.NETWORK.SYMBOL}
            </s.TextTitle>




            <span
              style={{
                textAlign: "center",
              }}
            >

            </span>

            <s.SpacerLarge />




            {Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
              <>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--primary-text)" }}
                >
                  The sale has ended.
                </s.TextTitle>
                <s.TextDescription
                  style={{ textAlign: "center", color: "var(--primary-text)" }}
                >
                  You can still find {CONFIG.NFT_NAME} on
                </s.TextDescription>

              </>
            ) : (
              <>

                {/* <s.SpacerXSmall />

                <s.SpacerSmall /> */}
                {blockchain.account === "" ||
                  blockchain.smartContract === null ? (
                  <s.Container ai={"center"} jc={"center"}>
                    <s.SpacerSmall />
                    <StyledButton
                      onClick={(e) => {
                        e.preventDefault();
                        dispatch(connect());
                        getData();
                      }}
                    >
                      MINT
                    </StyledButton>

                    {blockchain.errorMsg !== "" ? (
                      <>
                        <s.SpacerSmall />
                        <s.TextDescription
                          style={{
                            textAlign: "center",
                            color: "var(--accent-text)",
                          }}
                        >
                          {blockchain.errorMsg}
                        </s.TextDescription>
                      </>
                    ) : null}


                  </s.Container>
                ) : (
                  <>
                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--primary)",
                        fontSize: 20,
                      }}
                    >
                      Max 5 OG per wallet:
                    </s.TextDescription>
                    <s.SpacerMedium />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledRoundButton
                        style={{ lineHeight: 0.4 }}
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          decrementMintAmount();
                        }}
                      >
                        -
                      </StyledRoundButton>
                      <s.SpacerMedium />
                      <s.TextDescription
                        style={{
                          fontSize: 30,
                          textAlign: "center",
                          color: "var(--primary)",
                        }}
                      >
                        {mintAmount}
                      </s.TextDescription>
                      <s.SpacerMedium />
                      <StyledRoundButton
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          incrementMintAmount();
                        }}
                      >
                        +
                      </StyledRoundButton>

                      <s.SpacerMedium />

                    </s.Container>
                    <s.SpacerSmall />
                    <s.SpacerSmall />
                    <s.TextDescription
                      style={{
                        fontSize: 30,
                        textAlign: "center",
                        color: "var(--primary)",
                      }}
                    >
                      {(mintAmount * CONFIG.DISPLAY_COST).toFixed(3)} ETH
                    </s.TextDescription>

                    <s.SpacerSmall />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledButton
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          claimNFTs();
                          getData();
                        }}
                      >
                        {claimingNft ? "BUSY" : "MINT"}
                      </StyledButton>





                    </s.Container>

                  </>
                )}
              </>
            )}





            <s.SpacerLarge />
            <s.SpacerLarge />







            <s.TextDescription
              style={{
                textAlign: "left",
                fontSize: 30,
                //fontWeight: "bold",
                color: "var(--primary)",
              }}
            >
              Ordi Gals is an experimental NFT project. Are you ready to embark on a truly unique journey with Ordi Gals? Over the course of five intense experimental game theory games, you'll have the power to shape the ultimate form of your Ordi Gals.
              But make no mistake - this won't be an easy task. To maximize your benefits, you'll need patience, a bit of luck, and perhaps a few sleepless nights.
            </s.TextDescription>


            <s.TextDescription
              style={{
                textAlign: "left",
                fontSize: 30,
                //fontWeight: "bold",
                color: "var(--primary)",
              }}
            >
              There's nothing quite like the thrill of competition - and with Ordi Gals, the stakes are higher than ever. The top-performing Ordi Gals participants will have access to exclusive rewards, including coveted apartments in the heart of Galsland.
              But perhaps even more impressively, the winners will also be inscribed onto the Bitcoin blockchain via Ordinals Protocol for free - a true badge of honor in the NFT world. Ready to test your strategy?
            </s.TextDescription>
            <s.SpacerLarge />
            <s.SpacerLarge />
            <s.SpacerLarge />
            <s.SpacerLarge />


            <s.TextDescription
              style={{
                textAlign: "left",
                fontSize: 40,
                //fontWeight: "bold",
                color: "var(--primary)",
              }}
            >
              Ordi Gals GAMES
            </s.TextDescription>



            <s.TextDescription
              style={{
                textAlign: "left",
                fontSize: 40,
                //fontWeight: "bold",
                color: "var(--primary)",
              }}
            >
              Game 1: Ordi Gals Points
            </s.TextDescription>

            <s.TextDescription
              style={{
                textAlign: "left",
                fontSize: 30,
                //fontWeight: "bold",
                color: "var(--primary)",
              }}
            >
              Ordi Gals is about to take you on an exciting journey like no other! In just 24 hours after the public mint, get ready to join the first game - Ordi Gals Points.
              This is your chance to compete against other Ordi Gals owners and claim a spot in an Ethereum block that's farthest away from the blocks claimed by other players.
              But be warned - strategy, timing, and a bit of luck are crucial in this game. To gain this crucial advantage, keep your eyes on the 'LAST CLAIM' tracker on our webpage.
              Are you ready to step up to the challenge and shape the ultimate form of your Ordi Gals?
            </s.TextDescription>
            <s.SpacerLarge />
            <s.SpacerLarge />


            <s.TextDescription
              style={{
                textAlign: "left",
                fontSize: 30,
                //fontWeight: "bold",
                color: "var(--primary)",
              }}
            >
              Remember - in Ordi Gals Points, timing is everything. The goal is to claim a spot in an Ethereum block that's as far away as possible from the blocks claimed by other players.
              The farther away, the more points you earn. For example, if you make a claim 100 blocks after the last claim and no one else makes a claim in the next 20 blocks after you,
              you'll earn more points than if you make a claim when there was a claim just 15 blocks before you and 20 blocks after you.
              Keep this in mind and strategize wisely to maximize your chances of winning big in Ordi Gals Points.
            </s.TextDescription>
            <s.SpacerLarge />
            <s.SpacerLarge />
            <s.SpacerLarge />
            <s.SpacerLarge />



            <s.TextDescription
              style={{
                textAlign: "left",
                fontSize: 40,
                //fontWeight: "bold",
                color: "var(--primary)",
              }}
            >
              Game 2: Ordi Gals style meetup
            </s.TextDescription>


            <s.TextDescription
              style={{
                textAlign: "left",
                fontSize: 30,
                //fontWeight: "bold",
                color: "var(--primary)",
              }}
            >
              Get ready to show off your unique style in the Ordi Gals community!
              In our second game, Ordi Gals Style Meetup, Ordi Gals owners will have the opportunity to participate in multiple rounds of style picking on a specialized Discord server.
              You'll be able to choose your appearance from a wide variety of makeup, hair, clothes, and other accessories, all based on the Ordi Gals Points you earned in the first game.
            </s.TextDescription>

            <s.SpacerLarge />
            <s.SpacerLarge />


            <s.TextDescription
              style={{
                textAlign: "left",
                fontSize: 30,
                //fontWeight: "bold",
                color: "var(--primary)",
              }}
            >
              Our artists have created hundreds of items, so the number of possible combinations for your Ordi Gals is virtually limitless!
              Each owner will then have the chance to vote for their preferred styles, with the number of votes proportional to the number of Ordi Galss they own.
            </s.TextDescription>

            <s.SpacerLarge />
            <s.SpacerLarge />



            <s.TextDescription
              style={{
                textAlign: "left",
                fontSize: 30,
                //fontWeight: "bold",
                color: "var(--primary)",
              }}
            >
              While this game is all about fostering community interaction, the Ordi Gals that picks the most favorited styles will also receive a booster coefficient to their Ordi Gals Points,
              which will carry over to the next game. Keep in mind that your final Ordi Gals appearance will be decided after five days - so have fun experimenting with your style!
            </s.TextDescription>


            <s.SpacerLarge />
            <s.SpacerLarge />

            <s.SpacerLarge />
            <s.SpacerLarge />

            <s.TextDescription
              style={{
                textAlign: "center",
                fontSize: 40,
                //fontWeight: "bold",
                color: "var(--primary)",
              }}
            >
              Game 3: Ordi Gals Apartments
            </s.TextDescription>


            <s.TextDescription
              style={{
                textAlign: "left",
                fontSize: 30,
                //fontWeight: "bold",
                color: "var(--primary)",
              }}
            >
              Are you ready for the third game in the Ordi Gals experience? Introducing Ordi Gals Apartments - a game that gives you the chance to claim your very own apartment NFT,
              free of charge for Ordi Gals owners! These luxurious apartments are located in the center of Galsland and will be highly sought after. The more Ordi Gals Points you've earned, the better your chances of getting your dream apartment.
              Keep your eyes on the leaderboard to see where you stand - will you be the envy of your fellow Ordi Gals owners with a prime piece of real estate in the heart of Ordi Galsland?
            </s.TextDescription>


            <s.SpacerLarge />
            <s.SpacerLarge />



            <s.TextDescription
              style={{
                textAlign: "left",
                fontSize: 30,
                //fontWeight: "bold",
                color: "var(--primary)",
              }}
            >
              Simply owning an apartment isn't enough - the goal is to have the most visitors and become an important member of the community. Hidden chests of rewards await in other players' apartments,
              so you'll want to explore and discover as much as you can. With strategy, creativity, and community involvement, you could become the top Ordi Gals Apartment owner and reap the rewards.
            </s.TextDescription>


            <s.SpacerLarge />
            <s.SpacerLarge />

            <s.SpacerLarge />
            <s.SpacerLarge />


            <s.TextDescription
              style={{
                textAlign: "center",
                fontSize: 40,
                //fontWeight: "bold",
                color: "var(--primary)",
              }}
            >
              Game 4: Ordi Gals Carnival
            </s.TextDescription>


            <s.TextDescription
              style={{
                textAlign: "left",
                fontSize: 30,
                //fontWeight: "bold",
                color: "var(--primary)",
              }}
            >
              Get ready for the Ordi Gals Carnival - a wild and wacky virtual party that's all about letting loose and having fun! In this game,
              Ordi Gals owners will compete to see who can create the most entertaining content on our specialized Discord channel.
              Whether it's music, jokes, memes, or anything in between, it's all fair game - as long as it gets the crowd going.
            </s.TextDescription>



            <s.TextDescription
              style={{
                textAlign: "left",
                fontSize: 30,
                //fontWeight: "bold",
                color: "var(--primary)",
              }}
            >
              But the real isn't just about making people laugh or dance - it's about getting the most reactions on your content.
              The more people who like, comment, and share your posts, the higher you'll climb on the leaderboard.
              And if you can stay on top until the end of the game, you'll be crowned the ultimate Ordi Gals Carnival champion!
            </s.TextDescription>
            <s.SpacerLarge />
            <s.SpacerLarge />
            <s.SpacerLarge />
            <s.SpacerLarge />


            <s.TextDescription
              style={{
                textAlign: "left",
                fontSize: 40,
                //fontWeight: "bold",
                color: "var(--primary)",
              }}
            >
              Game 5: Ordi Gals Ordinals Bidding
            </s.TextDescription>


            <s.TextDescription
              style={{
                textAlign: "left",
                fontSize: 30,
                //fontWeight: "bold",
                color: "var(--primary)",
              }}
            >
              Ordi Gals owners will have a chance to bid for a spot to be inscribed to the Bitcoin blockchain via Ordinals protocol.
              The top 100 highest bidders will win the coveted spots, ensuring their place in history.
              Ordi Gals owners can use their hard-earned Ordi Gals points to bid on these spots, making every point count towards the ultimate prize.
              It's a high-stakes game that rewards both strategic thinking and a willingness to take risks. Do you have what it takes to win a spot on the blockchain and become a part of crypto history?
            </s.TextDescription>

            <s.SpacerLarge />
            <s.SpacerLarge />
            <s.SpacerLarge />
            <s.SpacerLarge />


            <s.TextDescription
              style={{
                textAlign: "left",
                fontSize: 40,
                //fontWeight: "bold",
                color: "var(--primary)",
              }}
            >
              Final Ordi Gals Appearance
            </s.TextDescription>


            <s.TextDescription
              style={{
                textAlign: "left",
                fontSize: 30,
                //fontWeight: "bold",
                color: "var(--primary)",
              }}
            >
              The ultimate goal of the Ordi Gals experience. Even if your Ordi Gals is not inscribed to the Bitcoin blockchain,
              it will still live on the Ethereum chain with a unique appearance that you can personalize based on the number of points you collect throughout the five days of games.
              The more points you earn, the more options you'll have to create a truly one-of-a-kind Ordi Gals. Get ready to unleash your creativity and compete to make your Ordi Gals stand out in the blockchain world.
            </s.TextDescription>




            <s.SpacerLarge />
            <s.SpacerLarge />
            <s.SpacerLarge />
            <s.SpacerLarge />


            <s.TextDescription
              style={{
                textAlign: "left",
                fontSize: 40,
                //fontWeight: "bold",
                color: "var(--primary)",
              }}
            >
              Team behind the project
            </s.TextDescription>
            <s.SpacerLarge />
            <s.SpacerLarge />

            <s.TextDescription
              style={{
                textAlign: "left",
                fontSize: 40,
                //fontWeight: "bold",
                color: "var(--primary)",
              }}
            >
              Sarah: Marketing Director
            </s.TextDescription>

            <s.TextDescription
              style={{
                textAlign: "left",
                fontSize: 30,
                //fontWeight: "bold",
                color: "var(--primary)",
              }}
            >
              Sarah is an experienced marketer who has worked with several blockchain projects in the past.
              She is responsible for developing and implementing the marketing strategy for the Ordi Gals project.
              With her expertise, she has helped to create a strong brand identity for Ordi Gals and has attracted a large community of supporters.
            </s.TextDescription>
            <s.SpacerLarge />
            <s.SpacerLarge />

            <s.TextDescription
              style={{
                textAlign: "left",
                fontSize: 40,
                //fontWeight: "bold",
                color: "var(--primary)",
              }}
            >
              Michael: Lead Developer
            </s.TextDescription>

            <s.TextDescription
              style={{
                textAlign: "left",
                fontSize: 30,
                //fontWeight: "bold",
                color: "var(--primary)",
              }}
            >
              Michael is a skilled developer with a background in blockchain technology. He leads the technical development of the Ordi Gals project,
              ensuring that it operates smoothly and securely. Michael has a deep understanding of Ethereum and Bitcoin blockchains, and he works to ensure that the project is optimized for both.
            </s.TextDescription>
            <s.SpacerLarge />
            <s.SpacerLarge />

            <s.TextDescription
              style={{
                textAlign: "left",
                fontSize: 40,
                //fontWeight: "bold",
                color: "var(--primary)",
              }}
            >
              Xander: Community Manager
            </s.TextDescription>

            <s.TextDescription
              style={{
                textAlign: "left",
                fontSize: 30,
                //fontWeight: "bold",
                color: "var(--primary)",
              }}
            >
              Xander is responsible for building and managing the community of Ordi Gals owners. He oversees the Discord server, manages social media accounts, and coordinates events and games.
              Xander is passionate about fostering a strong sense of community among Ordi Gals owners and works tirelessly to ensure that everyone feels included and valued.
            </s.TextDescription>
            <s.SpacerLarge />
            <s.SpacerLarge />


            <s.TextDescription
              style={{
                textAlign: "left",
                fontSize: 40,
                //fontWeight: "bold",
                color: "var(--primary)",
              }}
            >
              Alex: Art Director
            </s.TextDescription>

            <s.TextDescription
              style={{
                textAlign: "left",
                fontSize: 30,
                //fontWeight: "bold",
                color: "var(--primary)",
              }}
            >
              Alex is a seasoned designer and digital artist with a passion for anime. With over a decade of experience in the industry,
              he has honed his skills in creating stunning and engaging visuals that capture the essence of Japanese animation.
              His love for the medium has led him to work on a number of high-profile anime-inspired projects, including mobile games, webcomics, and animated shorts.
              As a member of the Ordi Gals team, Alex brings his unique perspective and creative flair to the development of the project,
              ensuring that every aspect of the experience is visually compelling and engaging for fans of anime and digital art alike.
            </s.TextDescription>
            <s.SpacerLarge />
            <s.SpacerLarge />

            <s.TextDescription
              style={{
                textAlign: "left",
                fontSize: 40,
                //fontWeight: "bold",
                color: "var(--primary)",
              }}
            >
              James: Financial Advisor
            </s.TextDescription>

            <s.TextDescription
              style={{
                textAlign: "left",
                fontSize: 30,
                //fontWeight: "bold",
                color: "var(--primary)",
              }}
            >
              James brings a wealth of financial experience to the Ordi Gals project. He has worked in finance for many years,
              and he provides valuable advice on financial matters such as budgeting, investment, and fundraising.
              James is dedicated to ensuring that the Ordi Gals project is financially sustainable and successful in the long term.
            </s.TextDescription>







          </s.Container>
          <s.SpacerLarge />
        </ResponsiveWrapper>




        <s.SpacerLarge />

        <s.SpacerLarge />

        <s.SpacerMedium />

      </s.Container>
    </s.Screen>
  );
}

export default App;