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
  background-color: var(--accent);
  padding: 10px;
  font-weight: bold;
  font-size: 20px;
  color: var(--primary-text);
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
  background-color: var(--accent);
  padding: 10px;
  font-weight: bold;
  font-size: 25px;
  color: var(--primary-text);
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
  const endTime = new Date("2023-07-06T13:00:00Z");
  const initialTimeRemaining = endTime - new Date();
  const [mintOpen, setMintOpen] = useState(initialTimeRemaining <= 1000);
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(`Click to mint your HANDS.`);
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


            <s.SpacerLarge />
            <s.SpacerLarge />
            <s.SpacerLarge />

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
              Public Mint:  July 06, 13:00 UTC
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
              style={{ textAlign: "center", color: "var(--primary)", fontSize: 40 }}
            >
              Price: {CONFIG.DISPLAY_COST}{" "}
              {CONFIG.NETWORK.SYMBOL}
            </s.TextTitle>





            <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: 40,
                //fontWeight: "bold",
                color: "var(--primary)",
              }}
            >
              {data.totalSupply}/{CONFIG.MAX_SUPPLY}
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
                  You can still find {CONFIG.NFT_NAME} on Opensea
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
                      Connect
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
                        fontSize: 30,
                      }}
                    >
                      Max 5 per wallet:
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
            <s.SpacerLarge />
            <s.SpacerLarge />
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
              Golden Stories, Unraveled.
            </s.TextDescription>
            <s.SpacerLarge />


            <s.TextDescription
              style={{
                textAlign: "left",
                fontSize: 30,
                //fontWeight: "bold",
                color: "var(--primary)",
              }}
            >
              The collection breathes life into unique digital tokens, each embodied by a golden hand image. Beyond being aesthetically appealing, HANDS resonate with ideas of strength, creativity, and freedom.
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
              Every golden hand in the Hand of Aurum collection transcends beyond a digital asset; it narrates a story.
              Each carefully designed gesture fosters a sense of connection and empowerment. Think of these hands as your personal guide in the vast and evolving world of Web3.
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
              Hands of Aurum is more than a mere intersection of art and technology; it's where they converge to create an electrifying experience.
              This project represents a trailblazing step into the future of art appreciation in the blockchain era, offering a platform where you can express your distinctive flair.
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
              Team behind the project
            </s.TextDescription>
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
              She is responsible for developing and implementing the marketing strategy for the Hands Of Aurum project.
              With her expertise, she has helped to create a strong brand identity for Hands Of Aurum and has attracted a large community of supporters.
            </s.TextDescription>
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
              Michael is a skilled developer with a background in blockchain technology. He leads the technical development of the Hands Of Aurum project,
              ensuring that it operates smoothly and securely. Michael has a deep understanding of Ethereum blockchain.
            </s.TextDescription>
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
              Xander is responsible for building and managing the community of Hands Of Aurum owners. He oversees the Discord server, manages social media accounts, and coordinates events and games.
              Xander is passionate about fostering a strong sense of community among Hands Of Aurum owners and works tirelessly to ensure that everyone feels included and valued.
            </s.TextDescription>
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
              Alex is a seasoned digital artist with a knack for the blockchain world. With over a decade in the industry, his artistry revolves around translating the ethos of blockchain into striking visuals.
              His experience spans high-profile projects, from decentralized apps to crypto games and NFTs. Now at the helm of Hands of Aurum,
              Alex lends his distinctive creativity to shape each token into a unique embodiment of strength and freedom. For blockchain enthusiasts and digital art fans, Alex's work is a captivating journey into the golden essence of Web3.
            </s.TextDescription>
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
              James brings a wealth of financial experience to the Hands Of Aurum project. He has worked in finance for many years,
              and he provides valuable advice on financial matters such as budgeting, investment, and fundraising.
              James is dedicated to ensuring that the Hands Of Aurum project is financially sustainable and successful in the long term.
            </s.TextDescription>









            <s.SpacerLarge />
            <s.SpacerLarge />








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