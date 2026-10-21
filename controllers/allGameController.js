import axios from "axios";
import connection from "../config/connectDB";

const apiUrl = "https://zapcore.live/api";
const key = "880h7Ptu2VvetP2BVrWVyul74JR2tNw2";

const checkBalance = async (req, res) => {
  try {
    const playerid = req.body.playerid;
    if (!playerid) {
      return res.status(400).json({
        message: "Undefined token",
        status: false,
      });
    }
    // Call the `/games/open` API
    const response = await axios.post(`${apiUrl}/Userbalance`, {
      playerid,
      key,
    });
    // //console.log("resd",response)

    if (response.data.status) {
      return res.status(200).json({
        message: "get balance successfully.",
        status: true,
        data: response.data,
      });
    } else {
      return res.status(500).json({
        message: "Internal server error",
        status: false,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      status: false,
      error: error.message,
    });
  }
};

function timerJoin2(params = "", addHours = 0) {
  let date = params ? new Date(Number(params)) : new Date();
  if (addHours !== 0) {
    date.setHours(date.getHours() + addHours);
  }

  const options = {
    timeZone: "Asia/Kolkata", // Specify the desired time zone
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false, // 24-hour format
  };

  const formatter = new Intl.DateTimeFormat("en-GB", options);
  const parts = formatter.formatToParts(date);

  const getPart = (type) => parts.find((part) => part.type === type).value;

  const formattedDate = `${getPart("year")}-${getPart("month")}-${getPart(
    "day"
  )} ${getPart("hour")}:${getPart("minute")}:${getPart("second")}`;

  return formattedDate;
}

const transferBalance = async (req, res) => {
  try {
    const playerid = req.body.playerid;

    if (!playerid) {
      return res.status(400).json({
        message: "Undefined token",
        status: false,
      });
    }
    const responses = await axios.post(`${apiUrl}/Userbalance`, {
      playerid,
      key,
    });

    if (responses.data.Balance <= 0) {
      return res.status(500).json({
        message: "Insufficient balance",
        status: false,
      });
    }


let checkTime = timerJoin2(Date.now());

    const datasql =
      "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?, `time` = ?";
    await connection.query(datasql, [playerid, "Game moved out", responses.data.Balance, checkTime]);


    // Call the `/games/open` API
    const response = await axios.post(`${apiUrl}/Setbalance`, {
      playerid,
      key,
      opening_balance: -responses.data.Balance,
    });

    if (response.data.status) {
      await connection.query(
        "UPDATE users SET money =  ? WHERE phone = ?",
        [Number(response.data.BeforeBalance), playerid]
      );
      return res.status(200).json({
        message: "transfer balance successfully.",
        status: true,
        data: response.data,
      });
    } else {
      return res.status(500).json({
        message: "Internal server error",
        status: false,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      status: false,
      error: error.message,
    });
  }
};

const launchGame = async (req, res) => {
  let resdata = null;
  try {
    const playerid = req.body.playerid;
    const uid = req.body.gameId;

    if (!playerid) {
      return res.status(400).json({
        message: "Undefined token",
        status: false,
      });
    }

    const [users] = await connection.execute(
      "SELECT * FROM users WHERE phone = ?",
      [playerid]
    );

    if (!users.length) {
      return res.status(200).json({
        message: "Invalid user",
        status: false,
      });
    }

    const userInfo = users[0];

    const response = await axios.post(`${apiUrl}/launch-game`, {
      playerid,
      key,
      uid,
      opening_balance: userInfo.money,
    });

    resdata = response.data;
console.log(response)
    if (resdata.status) {
      await connection.query("UPDATE users SET money = ? WHERE phone = ?", [
        0,
        playerid,
      ]);


if(userInfo.money>0){
    let checkTime = timerJoin2(Date.now());
    const datasql =
      "INSERT INTO transaction_history SET phone = ?, detail = ?, balance = ?,status=?, `time` = ?";
    await connection.query(datasql, [playerid, "Game moved in", userInfo.money,2, checkTime]);

}
      return res.status(200).json({
        message: "Start game successfully.",
        status: true,
        data: resdata,
      });
    } else {
        
      return res.status(500).json({
        message: "Internal server error (game launch failed)",
        status: false,
        error: resdata,
      });
    }
  } catch (error) {
    // Check if axios provided a response
    if (error.response && error.response.data) {
      resdata = error.response.data;
    }

    console.error("Launch game error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
      status: false,
      error: error.message,
      data: resdata, // This will now include the actual API error response if available
    });
  }
};

const getgamedetails = async (req, res) => {
  try {
    const { page, size } = req.query;

    if (!page || !size) {
      return res.status(400).json({
        message: "Undefined page & size",
        status: false,
      });
    }

    const response = await axios.get(
      `${apiUrl}/getgamedetails?page=${page}&size=${size}`
    );
    if (response.data.status) {
      return res.status(200).json({
        message: "get game list successfully.",
        status: true,
        data: response.data,
      });
    } else {
      return res.status(500).json({
        message: "Internal server error",
        status: false,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      status: false,
      error: error.message,
    });
  }
};

const gameProvider = async (req, res) => {
  try {
    const response = await axios.get(
      `${apiUrl}/getgamedetails?provider_list=1`
    );
    if (response.data.status) {
      return res.status(200).json({
        message: "get game provider successfully.",
        status: true,
        data: response.data,
      });
    } else {
      return res.status(500).json({
        message: "Internal server error",
        status: false,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      status: false,
      error: error.message,
    });
  }
};

const gameType = async (req, res) => {
  try {
    const response = await axios.get(
      `${apiUrl}/getgamedetails?gametype_list=1`
    );
    if (response.data.status) {
      return res.status(200).json({
        message: "get game type successfully.",
        status: true,
        data: response.data,
      });
    } else {
      return res.status(500).json({
        message: "Internal server error",
        status: false,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      status: false,
      error: error.message,
    });
  }
};




 const typeAndProviderData= [
        {
            "id": 301,
            "game_name": "Fan Tan",
            "game_uid": "5cb6aa4e2ce1c775c568561401ffdfca",
            "game_type": "CasinoLive",
            "provider": "evolutionlive",
            "icon": "https://ossimg.tirangaagent.com/Tiranga/gamelogo/EVO_Video/FanTan0000000001.png"
        },
        {
            "id": 302,
            "game_name": "Speed Roulette",
            "game_uid": "b4af506243cafae52908e8fa266f8ff6",
            "game_type": "CasinoLive",
            "provider": "evolutionlive",
            "icon": "https://ossimg.tirangaagent.com/Tiranga/gamelogo/EVO_Video/lkcbrbdckjxajdol.png"
        },
        {
            "id": 303,
            "game_name": "Infinite Blackjack",
            "game_uid": "58d7089aa20bce7f70e0e2ce81e888f4",
            "game_type": "CasinoLive",
            "provider": "evolutionlive",
            "icon": "https://ossimg.tirangaagent.com/Tiranga/gamelogo/EVO_Video/mrfykemt5slanyi5.png"
        },
        {
            "id": 304,
            "game_name": "Craps",
            "game_uid": "689dd8e8f17dae910dba9fdd4990d41e",
            "game_type": "CasinoLive",
            "provider": "evolutionlive",
            "icon": "https://ossimg.tirangaagent.com/Tiranga/gamelogo/EVO_Video/Craps00000000001.png"
        },
        {
            "id": 305,
            "game_name": "Baccarat Squeeze",
            "game_uid": "404f0952ac7e25d242f2079dfe390983",
            "game_type": "CasinoLive",
            "provider": "evolutionlive",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/evoplay/Baccarat Squeeze.png"
        },
        {
            "id": 306,
            "game_name": "Super Sic Bo",
            "game_uid": "e3951a5bf624e822a22cba1cbe619df5",
            "game_type": "CasinoLive",
            "provider": "evolutionlive",
            "icon": "https://ossimg.tirangaagent.com/Tiranga/gamelogo/EVO_Video/SuperSicBo000001.png"
        },
        {
            "id": 307,
            "game_name": "First Person Dream Catcher",
            "game_uid": "7ee0da50996278d7fe5136f86f368fa5",
            "game_type": "CasinoLive",
            "provider": "evolutionlive",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/evoplay/First Person Dream Catcher.png"
        },
        {
            "id": 308,
            "game_name": "First Person Dragon Tiger",
            "game_uid": "4b4c45709dfd8188d7d6d12fae15bd42",
            "game_type": "CasinoLive",
            "provider": "evolutionlive",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/evoplay/First Person Dragon Tiger.png"
        },
        {
            "id": 309,
            "game_name": "First Person Mega Ball",
            "game_uid": "3150b1cd8fbbddd94d36f20fab504653",
            "game_type": "CasinoLive",
            "provider": "evolutionlive",
            "icon": "https://games.evolution.com/wp-content/uploads/2023/04/fp_mega_ball_thumbnail_600x840_2023_04.jpg"
        },
        {
            "id": 310,
            "game_name": "First Person Lightning Baccarat",
            "game_uid": "fec1b730e804bf14bd471a1e9b82bf44",
            "game_type": "CasinoLive",
            "provider": "evolutionlive",
            "icon": "https://ossimg.tirangaagent.com/Tiranga/gamelogo/EVO_Video/rng-lbaccarat000.png"
        },
        {
            "id": 311,
            "game_name": "First Person Craps",
            "game_uid": "823245918aa2afd108a5912e363c083c",
            "game_type": "CasinoLive",
            "provider": "evolutionlive",
            "icon": "https://games.evolution.com/wp-content/uploads/2023/04/first_person_craps_thumbnail_600x840_2023_03.jpg"
        },
        {
            "id": 312,
            "game_name": "First Person Baccarat",
            "game_uid": "e18dfa4a5dd4a0f2d8b45337bd6abb9d",
            "game_type": "CasinoLive",
            "provider": "evolutionlive",
            "icon": "https://games.evolution.com/wp-content/uploads/2023/04/first_person_baccarat_thumbnail_600x840_2023_03.jpg"
        },
        {
            "id": 313,
            "game_name": "First Person Golden Wealth Baccarat",
            "game_uid": "88e49e3fb9a9883f01f167d03f5efdcb",
            "game_type": "CasinoLive",
            "provider": "evolutionlive",
            "icon": "https://ossimg.tirangaagent.com/Tiranga/gamelogo/EVO_Video/rng-gwbaccarat00.png"
        },
        {
            "id": 314,
            "game_name": "First Person American Roulette",
            "game_uid": "88b2d98462fbc45d6d31e95083e183df",
            "game_type": "CasinoLive",
            "provider": "evolutionlive",
            "icon": "https://games.evolution.com/wp-content/uploads/2023/04/first_person_american_roulette_thumbnail_600x840_2023_03.jpg"
        },
        {
            "id": 315,
            "game_name": "First Person Deal or No Deal",
            "game_uid": "c715eb06391fabe5275d0b56440f49f3",
            "game_type": "CasinoLive",
            "provider": "evolutionlive",
            "icon": "https://games.evolution.com/wp-content/uploads/2025/03/first_person_deal_or_no_deal_thumbnail_600x840_2025_03.jpg"
        },
        {
            "id": 316,
            "game_name": "First Person Blackjack",
            "game_uid": "4ac0e874a4d5fc55bcdba5302b43bc96",
            "game_type": "CasinoLive",
            "provider": "evolutionlive",
            "icon": "https://games.evolution.com/wp-content/uploads/2023/04/fp_blackjack_thumbnail_600x840_2023_04.jpg"
        },
        {
            "id": 317,
            "game_name": "First Person Lightning Blackjack",
            "game_uid": "74914b065a9e6b9c7cb8a0e4b17294ed",
            "game_type": "CasinoLive",
            "provider": "evolutionlive",
            "icon": "https://ossimg.tirangaagent.com/Tiranga/gamelogo/EVO_Video/rng-bj-lightning.png"
        },
        {
            "id": 318,
            "game_name": "First Person Roulette",
            "game_uid": "a82670530f49a6b3445dc1a592a2eb9e",
            "game_type": "CasinoLive",
            "provider": "evolutionlive",
            "icon": "https://ossimg.tirangaagent.com/Tiranga/gamelogo/EVO_Video/rng-rt-european0.png"
        },
        {
            "id": 319,
            "game_name": "Dream Catcher",
            "game_uid": "7f50a6fbfcd9257299303b5757d43525",
            "game_type": "CasinoLive",
            "provider": "evolutionlive",
            "icon": "https://ossimg.tirangaagent.com/Tiranga/gamelogo/EVO_Video/MOWDream00000001.png"
        },
        {
            "id": 320,
            "game_name": "Football Studio Dice",
            "game_uid": "1909b4e3380dc37654f8e3997e63ec1b",
            "game_type": "CasinoLive",
            "provider": "evolutionlive",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/evoplay/Football Studio Dice.png"
        },
        {
            "id": 321,
            "game_name": "Dead or Alive: Saloon",
            "game_uid": "eda1a2c5edb8370f8df58dcf8e1381b9",
            "game_type": "CasinoLive",
            "provider": "evolutionlive",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/evoplay/Dead or Alive: Saloon.png"
        },
        {
            "id": 322,
            "game_name": "First Person Lightning Roulette",
            "game_uid": "f5ee6fce16d369d1a656f3b227fc7236",
            "game_type": "CasinoLive",
            "provider": "evolutionlive",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/evoplay/First Person Lightning Roulette.png"
        },
        {
            "id": 323,
            "game_name": "Football Studio",
            "game_uid": "392e13e38b3cec5ad259254a206d343a",
            "game_type": "CasinoLive",
            "provider": "evolutionlive",
            "icon": "https://ossimg.tirangaagent.com/Tiranga/gamelogo/EVO_Video/TopCard000000001.png"
        },
        {
            "id": 324,
            "game_name": "Cash or Crash",
            "game_uid": "b53a604877024ef2eab9946898e65d6b",
            "game_type": "CasinoLive",
            "provider": "evolutionlive",
            "icon": "https://ossimg.tirangaagent.com/Tiranga/gamelogo/EVO_Video/CashOrCrash00001.png"
        },
        // jilli
          {
            "id": 756,
            "game_name": "Go Rush",
            "game_uid": "edef29b5eda8e2eaf721d7315491c51d",
            "game_type": "Crash Game",
            "provider": "jili",
            "icon": "https://ossimg.6club-club.com/6club/gamelogo/JILI/224.png"
        },
        {
            "id": 757,
            "game_name": "Mines",
            "game_uid": "72ce7e04ce95ee94eef172c0dfd6dc17",
            "game_type": "Crash Game",
            "provider": "jili",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Mines.png"
        },
        {
            "id": 758,
            "game_name": "Tower",
            "game_uid": "8e939551b9e785001fcb5b0a32f88aba",
            "game_type": "Crash Game",
            "provider": "jili",
            "icon": "https://ossimg.6club-club.com/6club/gamelogo/JILI/232.png"
        },
        {
            "id": 759,
            "game_name": "HILO",
            "game_uid": "bd8a2bb2dd63503b93cf6ac9492786ce",
            "game_type": "Crash Game",
            "provider": "jili",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/HILO.png"
        },
        {
            "id": 760,
            "game_name": "Limbo",
            "game_uid": "eabf08253165b6bb2646e403de625d1a",
            "game_type": "Crash Game",
            "provider": "jili",
            "icon": "https://ossimg.6club-club.com/6club/gamelogo/JILI/235.png"
        },
        {
            "id": 761,
            "game_name": "Wheel",
            "game_uid": "6e19e03c50f035ddd9ffd804c30f8c80",
            "game_type": "Crash Game",
            "provider": "jili",
            "icon": "https://ossimg.6club-club.com/6club/gamelogo/JILI/236.png"
        },
        {
            "id": 762,
            "game_name": "Mines Gold",
            "game_uid": "4bceeb28b1a88c87d1ef518d7af2bba9",
            "game_type": "Crash Game",
            "provider": "jili",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Mines-Gold.png"
        },
        {
            "id": 763,
            "game_name": "Keno",
            "game_uid": "a54e3f5e231085c7d8ba99e8ed2261fc",
            "game_type": "Crash Game",
            "provider": "jili",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Keno.png"
        },
        {
            "id": 764,
            "game_name": "Plinko",
            "game_uid": "e3b71c6844eb8c30f5ef210ad92725a6",
            "game_type": "Crash Game",
            "provider": "jili",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Plinko.png"
        },
        {
            "id": 765,
            "game_name": "Crash Bonus",
            "game_uid": "a7f3e5f210523a989a7c6b32f2f1ad42",
            "game_type": "Crash Game",
            "provider": "jili",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Crash-Bonus.png"
        },
       
            {
                "id": 645,
                "game_name": "Chin Shi Huang",
                "game_uid": "24da72b49b0dd0e5cbef9579d09d8981",
                "game_type": "Slot Game",
                "provider": "jili",
                "icon": "https://ossimg.6club-club.com/6club/gamelogo/JILI/2.png"
            },
            {
                "id": 646,
                "game_name": "God Of Martial",
                "game_uid": "21ef8a7ddd39836979170a2e7584e333",
                "game_type": "Slot Game",
                "provider": "jili",
                "icon": "https://ossimg.6club-club.com/6club/gamelogo/JILI/4.png"
            },
            {
                "id": 647,
                "game_name": "Hot Chilli",
                "game_uid": "c845960c81d27d7880a636424e53964d",
                "game_type": "Slot Game",
                "provider": "jili",
                "icon": "https://ossimg.6club-club.com/6club/gamelogo/JILI/5.png"
            },
            {
                "id": 648,
                "game_name": "Fortune Tree",
                "game_uid": "6a7e156ceec5c581cd6b9251854fe504",
                "game_type": "Slot Game",
                "provider": "jili",
                "icon": "https://ossimg.6club-club.com/6club/gamelogo/JILI/6.png"
            },
            {
                "id": 649,
                "game_name": "War Of Dragons",
                "game_uid": "4b1d7ffaf9f66e6152ea93a6d0e4215b",
                "game_type": "Slot Game",
                "provider": "jili",
                "icon": "https://ossimg.6club-club.com/6club/gamelogo/JILI/9.png"
            },
            {
                "id": 650,
                "game_name": "Gem Party",
                "game_uid": "756cf3c73a323b4bfec8d14864e3fada",
                "game_type": "Slot Game",
                "provider": "jili",
                "icon": "https://ossimg.6club-club.com/6club/gamelogo/JILI/10.png"
            },
            {
                "id": 651,
                "game_name": "Lucky Ball",
                "game_uid": "893669898cd25d9da589a384f1d004df",
                "game_type": "Slot Game",
                "provider": "jili",
                "icon": "https://ossimg.6club-club.com/6club/gamelogo/JILI/13.png"
            },
            {
                "id": 652,
                "game_name": "Hyper Burst",
                "game_uid": "a47b17970036b37c1347484cf6956920",
                "game_type": "Slot Game",
                "provider": "jili",
                "icon": "https://ossimg.6club-club.com/6club/gamelogo/JILI/14.png"
            },
            {
                "id": 653,
                "game_name": "Shanghai Beauty",
                "game_uid": "795d0cae623cbf34d7f1aa93bbcded28",
                "game_type": "Slot Game",
                "provider": "jili",
                "icon": "https://ossimg.6club-club.com/6club/gamelogo/JILI/17.png"
            },
            {
                "id": 654,
                "game_name": "Fa Fa Fa",
                "game_uid": "54c41adcf43fdb6d385e38bc09cd77ca",
                "game_type": "Slot Game",
                "provider": "jili",
                "icon": "https://ossimg.6club-club.com/6club/gamelogo/JILI/21.png"
            },
            {
                "id": 655,
                "game_name": "Candy Baby",
                "game_uid": "2cc3b68cbcfacac2f7ef2fe19abc3c22",
                "game_type": "Slot Game",
                "provider": "jili",
                "icon": "https://ossimg.6club-club.com/6club/gamelogo/JILI/23.png"
            },
            {
                "id": 656,
                "game_name": "Hawaii Beauty",
                "game_uid": "6409b758471b6df30c6b137b49f4d92e",
                "game_type": "Slot Game",
                "provider": "jili",
                "icon": "https://ossimg.6club-club.com/6club/gamelogo/JILI/26.png"
            },
            {
                "id": 657,
                "game_name": "SevenSevenSeven",
                "game_uid": "61d46add6841aad4758288d68015eca6",
                "game_type": "Slot Game",
                "provider": "jili",
                "icon": "https://ossimg.6club-club.com/6club/gamelogo/JILI/27.png"
            },
            {
                "id": 658,
                "game_name": "Bubble Beauty",
                "game_uid": "a78d2ed972aab8ba06181cc43c54a425",
                "game_type": "Slot Game",
                "provider": "jili",
                "icon": "https://ossimg.6club-club.com/6club/gamelogo/JILI/30.png"
            },
            {
                "id": 659,
                "game_name": "FortunePig",
                "game_uid": "8488c76ee2afb8077fbd7eec62721215",
                "game_type": "Slot Game",
                "provider": "jili",
                "icon": "https://ossimg.6club-club.com/6club/gamelogo/JILI/33.png"
            },
            {
                "id": 660,
                "game_name": "Crazy777",
                "game_uid": "8c62471fd4e28c084a61811a3958f7a1",
                "game_type": "Slot Game",
                "provider": "jili",
                "icon": "https://ossimg.6club-club.com/6club/gamelogo/JILI/35.png"
            },
            {
                "id": 661,
                "game_name": "Bao boon chin",
                "game_uid": "8c4ebb3dc5dcf7b7fe6a26d5aadd2c3d",
                "game_type": "Slot Game",
                "provider": "jili",
                "icon": "https://ossimg.6club-club.com/6club/gamelogo/JILI/36.png"
            },
            {
                "id": 662,
                "game_name": "Night City",
                "game_uid": "78e29705f7c6084114f46a0aeeea1372",
                "game_type": "Slot Game",
                "provider": "jili",
                "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Night-City.png"
            },
            {
                "id": 663,
                "game_name": "Fengshen",
                "game_uid": "09699fd0de13edbb6c4a194d7494640b",
                "game_type": "Slot Game",
                "provider": "jili",
                "icon": "https://ossimg.6club-club.com/6club/gamelogo/JILI/38.png"
            },
            {
                "id": 664,
                "game_name": "Crazy FaFaFa",
                "game_uid": "a57a8d5176b54d4c825bd1eee8ab34df",
                "game_type": "Slot Game",
                "provider": "jili",
                "icon": "https://ossimg.6club-club.com/6club/gamelogo/JILI/40.png"
            },
            // spribe
             {
                "id": 1686,
                "game_name": "Aviator",
                "game_uid": "a04d1f3eb8ccec8a4823bdf18e3f0e84",
                "game_type": "CasinoTable",
                "provider": "spribe",
                "icon": "https://ossimg.6club-club.com/6club/gamelogo/TB_Chess/800.png"
            },
            {
                "id": 1687,
                "game_name": "Dice",
                "game_uid": "8a87aae7a3624d284306e9c6fe1b3e9c",
                "game_type": "CasinoTable",
                "provider": "spribe",
                "icon": "https://ossimg.6club-club.com/6club/gamelogo/TB_Chess/102.png"
            },
            {
                "id": 1688,
                "game_name": "Goal",
                "game_uid": "c68a515f0b3b10eec96cf6d33299f4e2",
                "game_type": "CasinoTable",
                "provider": "spribe",
                "icon": "https://ossimg.6club-club.com/6club/gamelogo/TB_Chess/105.png"
            },
            {
                "id": 1689,
                "game_name": "Hi Lo",
                "game_uid": "a669c993b0e1f1b7da100fcf95516bdf",
                "game_type": "CasinoTable",
                "provider": "spribe",
                "icon": "https://ossimg.6club-club.com/6club/gamelogo/TB_Chess/101.png"
            },
            {
                "id": 1690,
                "game_name": "Hotline",
                "game_uid": "b31720b3cd65d917a1a96ef61a72b672",
                "game_type": "CasinoTable",
                "provider": "spribe",
                "icon": "https://ossimg.6club-club.com/6club/gamelogo/TB_Chess/107.png"
            },
            {
                "id": 1691,
                "game_name": "Keno",
                "game_uid": "c311eb4bbba03b105d150504931f2479",
                "game_type": "CasinoTable",
                "provider": "spribe",
                "icon": "https://ossimg.6club-club.com/6club/gamelogo/TB_Chess/106.png"
            },
            {
                "id": 1692,
                "game_name": "Mines",
                "game_uid": "5c4a12fb0a9b296d9b0d5f9e1cd41d65",
                "game_type": "CasinoTable",
                "provider": "spribe",
                "icon": "https://ossimg.6club-club.com/6club/gamelogo/TB_Chess/811.png"
            },
            {
                "id": 1693,
                "game_name": "Mini Roulette",
                "game_uid": "9dc7ac6155c5a19c1cc204853e426367",
                "game_type": "CasinoTable",
                "provider": "spribe",
                "icon": "https://ossimg.6club-club.com/6club/gamelogo/TB_Chess/104.png"
            },
            {
                "id": 1694,
                "game_name": "Plinko",
                "game_uid": "6ab7a4fe5161936012d6b06143918223",
                "game_type": "CasinoTable",
                "provider": "spribe",
                "icon": "https://ossimg.6club-club.com/6club/gamelogo/TB_Chess/103.png"
            },
            {
                "id": 1695,
                "game_name": "Balloon",
                "game_uid": "de88f202c5a8beeaccabbd944f8acfbf",
                "game_type": "CasinoTable",
                "provider": "spribe",
                "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/spribe/balloon.png"
            },
            {
                "id": 1696,
                "game_name": "Keno 80",
                "game_uid": "7a762edbe411ebc9be416870a734bd03",
                "game_type": "CasinoTable",
                "provider": "spribe",
                "icon": "https://ossimg.6club-club.com/6club/gamelogo/TB_Chess/900.png"
            },
            // Fish
            {
                "id": 634,
                "game_name": "Royal Fishing",
                "game_uid": "e794bf5717aca371152df192341fe68b",
                "game_type": "Fish Game",
                "provider": "jili",
                "icon": "https://ossimg.6club-club.com/6club/gamelogo/JILI/1.png"
            },
            {
                "id": 635,
                "game_name": "Bombing Fishing",
                "game_uid": "e333695bcff28acdbecc641ae6ee2b23",
                "game_type": "Fish Game",
                "provider": "jili",
                "icon": "https://ossimg.6club-club.com/6club/gamelogo/JILI/20.png"
            },
            {
                "id": 636,
                "game_name": "Dinosaur Tycoon",
                "game_uid": "eef3e28f0e3e7b72cbca61e7924d00f1",
                "game_type": "Fish Game",
                "provider": "jili",
                "icon": "https://ossimg.6club-club.com/6club/gamelogo/JILI/42.png"
            },
            {
                "id": 637,
                "game_name": "Jackpot Fishing",
                "game_uid": "3cf4a85cb6dcf4d8836c982c359cd72d",
                "game_type": "Fish Game",
                "provider": "jili",
                "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Jackpot-Fishing.png"
            },
            {
                "id": 638,
                "game_name": "Dragon Fortune",
                "game_uid": "1200b82493e4788d038849bca884d773",
                "game_type": "Fish Game",
                "provider": "jili",
                "icon": "https://ossimg.6club-club.com/6club/gamelogo/JILI/60.png"
            },
            {
                "id": 639,
                "game_name": "Mega Fishing",
                "game_uid": "caacafe3f64a6279e10a378ede09ff38",
                "game_type": "Fish Game",
                "provider": "jili",
                "icon": "https://ossimg.6club-club.com/6club/gamelogo/JILI/74.png"
            },
            {
                "id": 640,
                "game_name": "Boom Legend",
                "game_uid": "f02ede19c5953fce22c6098d860dadf4",
                "game_type": "Fish Game",
                "provider": "jili",
                "icon": "https://ossimg.6club-club.com/6club/gamelogo/JILI/71.png"
            },
            {
                "id": 641,
                "game_name": "Happy Fishing",
                "game_uid": "71c68a4ddb63bdc8488114a08e603f1c",
                "game_type": "Fish Game",
                "provider": "jili",
                "icon": "https://ossimg.6club-club.com/6club/gamelogo/JILI/82.png"
            },
            {
                "id": 642,
                "game_name": "All-star Fishing",
                "game_uid": "9ec2a18752f83e45ccedde8dfeb0f6a7",
                "game_type": "Fish Game",
                "provider": "jili",
                "icon": "https://ossimg.6club-club.com/6club/gamelogo/JILI/119.png"
            },
            {
                "id": 643,
                "game_name": "Dinosaur Tycoon II",
                "game_uid": "bbae6016f79f3df74e453eda164c08a4",
                "game_type": "Fish Game",
                "provider": "jili",
                "icon": "https://ossimg.6club-club.com/6club/gamelogo/JILI/212.png"
            },
            {
                "id": 644,
                "game_name": "Ocean King Jackpot",
                "game_uid": "564c48d53fcddd2bcf0bf3602d86c958",
                "game_type": "Fish Game",
                "provider": "jili",
                "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Ocean-King-Jackpot.png"
            },
             {
            "id": 744,
            "game_name": "Color Game",
            "game_uid": "2ac4917fbc8b2034307b0c3cdd90d416",
            "game_type": "Table Game",
            "provider": "jili",
            "icon": "https://ossimg.6club-club.com/6club/gamelogo/JILI/197.png"
        },
        {
            "id": 745,
            "game_name": "Go Goal BIngo",
            "game_uid": "4e5ddaa644badc5f68974a65bf7af02a",
            "game_type": "Table Game",
            "provider": "jili",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Go-Goal-BIngo.png"
        },
        {
            "id": 746,
            "game_name": "Calaca Bingo",
            "game_uid": "b2f05dae5370035a2675025953d1d115",
            "game_type": "Table Game",
            "provider": "jili",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Calaca-Bingo.png"
        },
        {
            "id": 747,
            "game_name": "PAPPU",
            "game_uid": "e5091890bbb65a5f9ceb657351fa73c1",
            "game_type": "Table Game",
            "provider": "jili",
            "icon": "https://ossimg.6club-club.com/6club/gamelogo/JILI/200.png"
        },
        {
            "id": 748,
            "game_name": "West Hunter Bingo",
            "game_uid": "8d2c1506dc4ae4c47d23f9359d71c360",
            "game_type": "Table Game",
            "provider": "jili",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/West-Hunter-Bingo.png"
        },
        {
            "id": 749,
            "game_name": "Bingo Adventure",
            "game_uid": "2303867628a9a62272da7576665bbc65",
            "game_type": "Table Game",
            "provider": "jili",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Bingo-Adventure.png"
        },
        {
            "id": 750,
            "game_name": "Golden Land",
            "game_uid": "05fc951a633d4c6b4bbe8c429cd63658",
            "game_type": "Table Game",
            "provider": "jili",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Golden-Land.png"
        },
        {
            "id": 751,
            "game_name": "Candyland Bingo",
            "game_uid": "711acbdf297ce40a09dd0e9023b63f50",
            "game_type": "Table Game",
            "provider": "jili",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Candyland-Bingo.png"
        },
        {
            "id": 752,
            "game_name": "Color Prediction",
            "game_uid": "4a64504353c2304a3061bfd31cd9a62e",
            "game_type": "Table Game",
            "provider": "jili",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Color-Prediction.png"
        },
        {
            "id": 753,
            "game_name": "Magic Lamp Bingo",
            "game_uid": "848ac1703885d5a86b54fbbf094b3b63",
            "game_type": "Table Game",
            "provider": "jili",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Magic-Lamp-Bingo.png"
        },
        {
            "id": 754,
            "game_name": "Pearls of Bingo",
            "game_uid": "0995142f4685f66dfdd1a54fffa66ffa",
            "game_type": "Table Game",
            "provider": "jili",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Pearls-of-Bingo.png"
        },
        {
            "id": 755,
            "game_name": "European Roulette",
            "game_uid": "d4fc911a31b3a61edd83bdd95e36f3bf",
            "game_type": "Table Game",
            "provider": "jili",
            "icon": "https://ossimg.6club-club.com/6club/gamelogo/JILI/114.png"
        },
         {
            "id": 766,
            "game_name": "TeenPatti",
            "game_uid": "f743cb55c2c4b737727ef144413937f4",
            "game_type": "India Poker Game",
            "provider": "jili",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/TeenPatti.png"
        },
        {
            "id": 767,
            "game_name": "AK47",
            "game_uid": "488c377662cad37a551bde18e2fbe785",
            "game_type": "India Poker Game",
            "provider": "jili",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/AK47.png"
        },
        {
            "id": 768,
            "game_name": "Andar Bahar",
            "game_uid": "6f48b3aa0b64c79a2dc320ea021148b5",
            "game_type": "India Poker Game",
            "provider": "jili",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Andar-Bahar.png"
        },
        {
            "id": 769,
            "game_name": "Rummy",
            "game_uid": "ae632f32c3a1e6803f9a6fbec16be28e",
            "game_type": "India Poker Game",
            "provider": "jili",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Rummy.png"
        },
        {
            "id": 770,
            "game_name": "Callbreak",
            "game_uid": "9092b5a56e001c60850c4c1184c53e07",
            "game_type": "India Poker Game",
            "provider": "jili",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Callbreak.png"
        },
        {
            "id": 771,
            "game_name": "TeenPatti Joker",
            "game_uid": "1a4eaca67612e65fdcae43f4c8a667a4",
            "game_type": "India Poker Game",
            "provider": "jili",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/TeenPatti-Joker.png"
        },
        {
            "id": 772,
            "game_name": "Callbreak Quick",
            "game_uid": "aa9a9916d6e48ba50afa3c2246b6dacb",
            "game_type": "India Poker Game",
            "provider": "jili",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Callbreak-Quick.png"
        },
        {
            "id": 773,
            "game_name": "TeenPatti 20-20",
            "game_uid": "1afa7db588d05de7b9abca4664542765",
            "game_type": "India Poker Game",
            "provider": "jili",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/TeenPatti-20-20.png"
        },
        {
            "id": 774,
            "game_name": "Ludo Quick",
            "game_uid": "bb1f14d788d37b06dc8f6701ed57ed0d",
            "game_type": "India Poker Game",
            "provider": "jili",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Ludo-Quick.png"
        },
        {
            "id": 775,
            "game_name": "Tongits Go",
            "game_uid": "26fbfab92a3837b7dbf767e783b173af",
            "game_type": "India Poker Game",
            "provider": "jili",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Tongits-Go.png"
        },
        {
            "id": 776,
            "game_name": "Pusoy Go",
            "game_uid": "f2879a3f20f305eadad13448e11c052e",
            "game_type": "India Poker Game",
            "provider": "jili",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Pusoy-Go.png"
        },
        {
            "id": 777,
            "game_name": "Blackjack",
            "game_uid": "3b502aee6c9e1ef0f698332ee1b76634",
            "game_type": "India Poker Game",
            "provider": "jili",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Blackjack.png"
        },
        {
            "id": 778,
            "game_name": "Blackjack Lucky Ladies",
            "game_uid": "d0d1c20062e28493e1750f27a1730c48",
            "game_type": "India Poker Game",
            "provider": "jili",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Blackjack-Lucky-Ladies.png"
        },
        {
            "id": 779,
            "game_name": "MINI FLUSH",
            "game_uid": "07afefc388ab6af8cf26f85286f83fae",
            "game_type": "India Poker Game",
            "provider": "jili",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/MINI-FLUSH.png"
        },
        {
            "id": 780,
            "game_name": "Pool Rummy",
            "game_uid": "43e7df819bf57722a8917bb328640b30",
            "game_type": "India Poker Game",
            "provider": "jili",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Pool-Rummy.png"
        },
        {
            "id": 781,
            "game_name": "Caribbean Stud Poker",
            "game_uid": "04c9784b0b1b162b2c86f9ce353da8b7",
            "game_type": "India Poker Game",
            "provider": "jili",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Caribbean-Stud-Poker.png"
        }
        
        
        
    ]









 const providerData= [
        {
            "id": 1686,
            "game_name": "Aviator",
            "game_uid": "a04d1f3eb8ccec8a4823bdf18e3f0e84",
            "game_type": "CasinoTable",
            "provider": "spribe",
            "icon": "https://ossimg.6club-club.com/6club/gamelogo/TB_Chess/800.png"
        },
        {
            "id": 1687,
            "game_name": "Dice",
            "game_uid": "8a87aae7a3624d284306e9c6fe1b3e9c",
            "game_type": "CasinoTable",
            "provider": "spribe",
            "icon": "https://ossimg.6club-club.com/6club/gamelogo/TB_Chess/102.png"
        },
        {
            "id": 1688,
            "game_name": "Goal",
            "game_uid": "c68a515f0b3b10eec96cf6d33299f4e2",
            "game_type": "CasinoTable",
            "provider": "spribe",
            "icon": "https://ossimg.6club-club.com/6club/gamelogo/TB_Chess/105.png"
        },
        {
            "id": 1689,
            "game_name": "Hi Lo",
            "game_uid": "a669c993b0e1f1b7da100fcf95516bdf",
            "game_type": "CasinoTable",
            "provider": "spribe",
            "icon": "https://ossimg.6club-club.com/6club/gamelogo/TB_Chess/101.png"
        },
        {
            "id": 1690,
            "game_name": "Hotline",
            "game_uid": "b31720b3cd65d917a1a96ef61a72b672",
            "game_type": "CasinoTable",
            "provider": "spribe",
            "icon": "https://ossimg.6club-club.com/6club/gamelogo/TB_Chess/107.png"
        },
        {
            "id": 1691,
            "game_name": "Keno",
            "game_uid": "c311eb4bbba03b105d150504931f2479",
            "game_type": "CasinoTable",
            "provider": "spribe",
            "icon": "https://ossimg.6club-club.com/6club/gamelogo/TB_Chess/106.png"
        },
        {
            "id": 1692,
            "game_name": "Mines",
            "game_uid": "5c4a12fb0a9b296d9b0d5f9e1cd41d65",
            "game_type": "CasinoTable",
            "provider": "spribe",
            "icon": "https://ossimg.6club-club.com/6club/gamelogo/TB_Chess/811.png"
        },
        {
            "id": 1693,
            "game_name": "Mini Roulette",
            "game_uid": "9dc7ac6155c5a19c1cc204853e426367",
            "game_type": "CasinoTable",
            "provider": "spribe",
            "icon": "https://ossimg.6club-club.com/6club/gamelogo/TB_Chess/104.png"
        },
        {
            "id": 1694,
            "game_name": "Plinko",
            "game_uid": "6ab7a4fe5161936012d6b06143918223",
            "game_type": "CasinoTable",
            "provider": "spribe",
            "icon": "https://ossimg.6club-club.com/6club/gamelogo/TB_Chess/103.png"
        },
        {
            "id": 1695,
            "game_name": "Balloon",
            "game_uid": "de88f202c5a8beeaccabbd944f8acfbf",
            "game_type": "CasinoTable",
            "provider": "spribe",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/spribe/balloon.png"
        },
        {
            "id": 1696,
            "game_name": "Keno 80",
            "game_uid": "7a762edbe411ebc9be416870a734bd03",
            "game_type": "CasinoTable",
            "provider": "spribe",
            "icon": "https://ossimg.6club-club.com/6club/gamelogo/TB_Chess/900.png"
        },
        {
            "id": 507,
            "game_name": "Dragon Soar",
            "game_uid": "9341a18d096ad901ef77338998f29098",
            "game_type": "Slot Game",
            "provider": "jdb",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Dragon-Soar.png"
        },
        {
            "id": 508,
            "game_name": "Pop Pop Candy",
            "game_uid": "fde142e65f14da39f784e9e5325e0a77",
            "game_type": "Slot Game",
            "provider": "jdb",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Pop-Pop-Candy.png"
        },
        {
            "id": 509,
            "game_name": "Open Sesame Mega",
            "game_uid": "cb5e57be0354264c6c7ea0cdf4eb18b3",
            "game_type": "Slot Game",
            "provider": "jdb",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Open-Sesame-Mega.png"
        },
        {
            "id": 510,
            "game_name": "Fruity Bonanza",
            "game_uid": "f5d6b418b755f3aefe3b9828f3112c9c",
            "game_type": "Slot Game",
            "provider": "jdb",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Fruity-Bonanza.png"
        },
        {
            "id": 511,
            "game_name": "Caishen Coming",
            "game_uid": "45ecec5dd5077785e7a09988b95bbd24",
            "game_type": "Slot Game",
            "provider": "jdb",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Caishen-Coming.png"
        },
        {
            "id": 512,
            "game_name": "Coocoo Farm",
            "game_uid": "d1f17fd51e474b0e72892332ea551ba1",
            "game_type": "Slot Game",
            "provider": "jdb",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Coocoo-Farm.png"
        },
        {
            "id": 513,
            "game_name": "Elemental Link Water",
            "game_uid": "b84274cdfa5731945a34bfd0db1ddeea",
            "game_type": "Slot Game",
            "provider": "jdb",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Elemental-Link-Water.png"
        },
        {
            "id": 514,
            "game_name": "Elemental Link Fire",
            "game_uid": "46016a772b92c7f47dfdc5873f184ef1",
            "game_type": "Slot Game",
            "provider": "jdb",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Elemental-Link-Fire.png"
        },
        {
            "id": 515,
            "game_name": "Birdsparty Deluxe",
            "game_uid": "786d1cd7f4fa9905c825378292f1204c",
            "game_type": "Slot Game",
            "provider": "jdb",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Birdsparty-Deluxe.png"
        },
        {
            "id": 516,
            "game_name": "Moneybags Man 2",
            "game_uid": "33c862e7db9e0e59ab3f8fe770f797da",
            "game_type": "Slot Game",
            "provider": "jdb",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Moneybags-Man-2.png"
        },
        {
            "id": 517,
            "game_name": "Trump Card",
            "game_uid": "96c010fc4a95792401e903213d7add44",
            "game_type": "Slot Game",
            "provider": "jdb",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Trump-Card.png"
        },
        {
            "id": 518,
            "game_name": "Fortune Neko",
            "game_uid": "49b706ccfe7c53727ee6760cd9a8721a",
            "game_type": "Slot Game",
            "provider": "jdb",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Fortune-Neko.png"
        },
        {
            "id": 519,
            "game_name": "Book Of Mystery",
            "game_uid": "13072a6eb2111c1b5202fe6155227e94",
            "game_type": "Slot Game",
            "provider": "jdb",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Book-Of-Mystery.png"
        },
        {
            "id": 520,
            "game_name": "Prosperitytiger",
            "game_uid": "1d704bbb187a113229f3fdaa3b5406fe",
            "game_type": "Slot Game",
            "provider": "jdb",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Prosperitytiger.png"
        },
        {
            "id": 521,
            "game_name": "Glamorous Girl",
            "game_uid": "2663e14e5b455525252a25d9bd99e840",
            "game_type": "Slot Game",
            "provider": "jdb",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Glamorous-Girl.png"
        },
        {
            "id": 522,
            "game_name": "Blossom Of Wealth",
            "game_uid": "ed6fbaeb7a104dd7ed96fa1683a48669",
            "game_type": "Slot Game",
            "provider": "jdb",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Blossom-Of-Wealth.png"
        },
        {
            "id": 523,
            "game_name": "Boom Fiesta",
            "game_uid": "1ffb31ff605f1a7862a138f5cd712056",
            "game_type": "Slot Game",
            "provider": "jdb",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Boom-Fiesta.png"
        },
        {
            "id": 524,
            "game_name": "Big Three Dragons",
            "game_uid": "600c338d3fca2da208f1bba2c9d29059",
            "game_type": "Slot Game",
            "provider": "jdb",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Big-Three-Dragons.png"
        },
        {
            "id": 525,
            "game_name": "Mayagoldcrazy",
            "game_uid": "6c8009d165293759bb218b72ba3c380f",
            "game_type": "Slot Game",
            "provider": "jdb",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Mayagoldcrazy.png"
        },
        {
            "id": 526,
            "game_name": "Lantern Wealth",
            "game_uid": "f2f2eae301311f0320ef669b68935546",
            "game_type": "Slot Game",
            "provider": "jdb",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Lantern-Wealth.png"
        },
          {
            "id": 35,
            "game_name": "Thai HILO",
            "game_uid": "e1bf4c2cf1dcf91182d3caf8e944f425",
            "game_type": "街机游戏",
            "provider": "cq9",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Thai-HILO.png"
        },
        {
            "id": 36,
            "game_name": "Xoc Dia",
            "game_uid": "87593975049b4839c5b9883188c825b8",
            "game_type": "街机游戏",
            "provider": "cq9",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Xoc-Dia.png"
        },
        {
            "id": 37,
            "game_name": "Mr.Bean",
            "game_uid": "83bc9b50ddeb49403086070bc61c8dac",
            "game_type": "街机游戏",
            "provider": "cq9",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Mr.Bean.png"
        },
        {
            "id": 38,
            "game_name": "Thai Fish Prawn Crab",
            "game_uid": "1636a3694f9eaab1ee27c253c43591aa",
            "game_type": "街机游戏",
            "provider": "cq9",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Thai-Fish-Prawn-Crab.png"
        },
        {
            "id": 39,
            "game_name": "Tenfold Eggs",
            "game_uid": "4bcc8e305d6747e524d698ce02c9e2c7",
            "game_type": "街机游戏",
            "provider": "cq9",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Tenfold-Eggs.png"
        },
        {
            "id": 40,
            "game_name": "Funky Bingo",
            "game_uid": "2075dc1439923a3210deba122fc0d631",
            "game_type": "街机游戏",
            "provider": "cq9",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Funky-Bingo.png"
        },
        {
            "id": 41,
            "game_name": "Jungle Party",
            "game_uid": "bac6b204228688e24eb808caaa459f78",
            "game_type": "街机游戏",
            "provider": "cq9",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Jungle-Party.png"
        },
        {
            "id": 42,
            "game_name": "Mummy's Treasure",
            "game_uid": "0fec5546ea03487eed57e76d4e57e608",
            "game_type": "街机游戏",
            "provider": "cq9",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Mummys-Treasure.png"
        },
        {
            "id": 43,
            "game_name": "Mini Roulette",
            "game_uid": "421ca8d057205d7af4e8cfea22cc906b",
            "game_type": "街机游戏",
            "provider": "cq9",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Mini-Roulette-.png"
        },
        {
            "id": 44,
            "game_name": "Mahjong Fruit",
            "game_uid": "52db8e8d4992293d9061398fc3f3869d",
            "game_type": "街机游戏",
            "provider": "cq9",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Mahjong-Fruit.png"
        },
        {
            "id": 45,
            "game_name": "K.O. Island",
            "game_uid": "55170f3e8904083bb698e15494175b85",
            "game_type": "街机游戏",
            "provider": "cq9",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/K.O.-Island.png"
        },
        {
            "id": 46,
            "game_name": "Dragon Ball Dozer",
            "game_uid": "5a0a7ee701c44fe34549b44333666148",
            "game_type": "街机游戏",
            "provider": "cq9",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Dragon-Ball-Dozer.png"
        },
        {
            "id": 47,
            "game_name": "3 2 1Go!",
            "game_uid": "c002f8b5cd124abe27b50d5e082364f4",
            "game_type": "街机游戏",
            "provider": "cq9",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/3-2-1Go!.png"
        },
        {
            "id": 48,
            "game_name": "Hanuman Bingo",
            "game_uid": "df98d0dcddb7526eecc11fe760a7d531",
            "game_type": "街机游戏",
            "provider": "cq9",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Hanuman-Bingo.png"
        },
        {
            "id": 49,
            "game_name": "Alice Run",
            "game_uid": "7c0f4e40cbbfee4d8017b42cb081ed1e",
            "game_type": "街机游戏",
            "provider": "cq9",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Alice-Run.png"
        },
        {
            "id": 50,
            "game_name": "Dragon Pachinko",
            "game_uid": "3f475158ba1e056a4858b18ba72a2887",
            "game_type": "街机游戏",
            "provider": "cq9",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Dragon-Pachinko.png"
        },
        {
            "id": 51,
            "game_name": "Seotda",
            "game_uid": "8b410b635a270f49ff933fd188741abf",
            "game_type": "街机游戏",
            "provider": "cq9",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Seotda.png"
        },
        {
            "id": 52,
            "game_name": "Alice Run JP",
            "game_uid": "b4c1e40c11261a77bdfa76dad2585da4",
            "game_type": "街机游戏",
            "provider": "cq9",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Alice-Run-JP.png"
        },
        {
            "id": 53,
            "game_name": "Oneshot Fishing",
            "game_uid": "8beb52f0188e78a2f39cd5ea63e22232",
            "game_type": "Fish Game",
            "provider": "cq9",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Oneshot-Fishing.png"
        },
        {
            "id": 54,
            "game_name": "Paradise",
            "game_uid": "201cd3554cef14c33b4f4011a9506d8d",
            "game_type": "Fish Game",
            "provider": "cq9",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Paradise.png"
        },
        
    ]



const jilidata=[
      {
            "id": 679,
            "game_name": "Lucky Coming",
            "game_uid": "ba858ec8e3b5e2b4da0d16b3a2330ca7",
            "game_type": "Slot Game",
            "provider": "jili",
            "icon": "https://ossimg.6club-club.com/6club/gamelogo/JILI/91.png"
        },
        {
            "id": 680,
            "game_name": "Super Rich",
            "game_uid": "b92f491a63ac84b106b056e9d46d35c5",
            "game_type": "Slot Game",
            "provider": "jili",
            "icon": "https://ossimg.6club-club.com/6club/gamelogo/JILI/100.png"
        },
        {
            "id": 681,
            "game_name": "Roma X",
            "game_uid": "e5ff8e72418fcc608d72ea21cc65fb70",
            "game_type": "Slot Game",
            "provider": "jili",
            "icon": "https://ossimg.6club-club.com/6club/gamelogo/JILI/102.png"
        },
        {
            "id": 682,
            "game_name": "Golden Empire",
            "game_uid": "490096198e28f770a3f85adb6ee49e0f",
            "game_type": "Slot Game",
            "provider": "jili",
            "icon": "https://ossimg.6club-club.com/6club/gamelogo/JILI/103.png"
        },
        {
            "id": 683,
            "game_name": "Fortune Gems",
            "game_uid": "a990de177577a2e6a889aaac5f57b429",
            "game_type": "Slot Game",
            "provider": "jili",
            "icon": "https://ossimg.6club-club.com/6club/gamelogo/JILI/109.png"
        },
        {
            "id": 684,
            "game_name": "Crazy Hunter",
            "game_uid": "69082f28fcd46cbfd10ce7a0051f24b6",
            "game_type": "Slot Game",
            "provider": "jili",
            "icon": "https://ossimg.6club-club.com/6club/gamelogo/JILI/92.png"
        },
        {
            "id": 685,
            "game_name": "Party Night",
            "game_uid": "d505541d522aa5ca01fc5e97cfcf2116",
            "game_type": "Slot Game",
            "provider": "jili",
            "icon": "https://ossimg.6club-club.com/6club/gamelogo/JILI/76.png"
        },
        {
            "id": 686,
            "game_name": "Magic Lamp",
            "game_uid": "582a58791928760c28ec4cef3392a49f",
            "game_type": "Slot Game",
            "provider": "jili",
            "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Magic-Lamp.png"
        },
        {
            "id": 687,
            "game_name": "Agent Ace",
            "game_uid": "8a4b4929e796fda657a2d38264346509",
            "game_type": "Slot Game",
            "provider": "jili",
            "icon": "https://ossimg.6club-club.com/6club/gamelogo/JILI/115.png"
        }
        ]




const casino10=[
      {
                "id": 346,
                "game_name": "Bac Bo",
                "game_uid": "9b25f8d744859c6840d16ff6103dc5a6",
                "game_type": "CasinoLive",
                "provider": "evolutionlive",
                "icon": "https://ossimg.tirangaagent.com/Tiranga/gamelogo/EVO_Video/BacBo00000000001.png"
            },
            {
                "id": 347,
                "game_name": "Dragon Tiger",
                "game_uid": "1fd20a344c9f147cdef85bbaa7447dcd",
                "game_type": "CasinoLive",
                "provider": "evolutionlive",
                "icon": "https://ossimg.tirangaagent.com/Tiranga/gamelogo/EVO_Video/DragonTiger00001.png"
            },
            {
                "id": 348,
                "game_name": "Imperial Quest",
                "game_uid": "624db9f6b362baf19796f281dfdee1ab",
                "game_type": "CasinoLive",
                "provider": "evolutionlive",
                "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/evoplay/Imperial Quest.png"
            },
            {
                "id": 349,
                "game_name": "Funky Time",
                "game_uid": "8405541014f364b7dc59657aa6892446",
                "game_type": "CasinoLive",
                "provider": "evolutionlive",
                "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/evoplay/Funky Time.png"
            },
            {
                "id": 350,
                "game_name": "Roleta Ao Vivo",
                "game_uid": "7476b40db4af067e4d00fa2dd2067ef9",
                "game_type": "CasinoLive",
                "provider": "evolutionlive",
                "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/evoplay/Roleta Ao Vivo.png"
            }]

const casino3=[
     {
                "id": 317,
                "game_name": "First Person Lightning Blackjack",
                "game_uid": "74914b065a9e6b9c7cb8a0e4b17294ed",
                "game_type": "CasinoLive",
                "provider": "evolutionlive",
                "icon": "https://ossimg.tirangaagent.com/Tiranga/gamelogo/EVO_Video/rng-bj-lightning.png"
            },
            {
                "id": 318,
                "game_name": "First Person Roulette",
                "game_uid": "a82670530f49a6b3445dc1a592a2eb9e",
                "game_type": "CasinoLive",
                "provider": "evolutionlive",
                "icon": "https://ossimg.tirangaagent.com/Tiranga/gamelogo/EVO_Video/rng-rt-european0.png"
            },
            {
                "id": 319,
                "game_name": "Dream Catcher",
                "game_uid": "7f50a6fbfcd9257299303b5757d43525",
                "game_type": "CasinoLive",
                "provider": "evolutionlive",
                "icon": "https://ossimg.tirangaagent.com/Tiranga/gamelogo/EVO_Video/MOWDream00000001.png"
            },
            {
                "id": 320,
                "game_name": "Football Studio Dice",
                "game_uid": "1909b4e3380dc37654f8e3997e63ec1b",
                "game_type": "CasinoLive",
                "provider": "evolutionlive",
                "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/evoplay/Football Studio Dice.png"
            },
            {
                "id": 321,
                "game_name": "Dead or Alive: Saloon",
                "game_uid": "eda1a2c5edb8370f8df58dcf8e1381b9",
                "game_type": "CasinoLive",
                "provider": "evolutionlive",
                "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/evoplay/Dead or Alive: Saloon.png"
            },
            {
                "id": 322,
                "game_name": "First Person Lightning Roulette",
                "game_uid": "f5ee6fce16d369d1a656f3b227fc7236",
                "game_type": "CasinoLive",
                "provider": "evolutionlive",
                "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/evoplay/First Person Lightning Roulette.png"
            },
            {
                "id": 323,
                "game_name": "Football Studio",
                "game_uid": "392e13e38b3cec5ad259254a206d343a",
                "game_type": "CasinoLive",
                "provider": "evolutionlive",
                "icon": "https://ossimg.tirangaagent.com/Tiranga/gamelogo/EVO_Video/TopCard000000001.png"
            },
            {
                "id": 324,
                "game_name": "Cash or Crash",
                "game_uid": "b53a604877024ef2eab9946898e65d6b",
                "game_type": "CasinoLive",
                "provider": "evolutionlive",
                "icon": "https://ossimg.tirangaagent.com/Tiranga/gamelogo/EVO_Video/CashOrCrash00001.png"
            }
    ]
    
    const casino4=[
        {
                "id": 325,
                "game_name": "Mega Ball",
                "game_uid": "3955853fc6a0b53f7f9b9cff0be19cb8",
                "game_type": "CasinoLive",
                "provider": "evolutionlive",
                "icon": "https://ossimg.tirangaagent.com/Tiranga/gamelogo/EVO_Video/MegaBall00000001.png"
            },
            {
                "id": 326,
                "game_name": "Teen Patti",
                "game_uid": "0617a82334f4f1766cf282ce906e1df7",
                "game_type": "CasinoLive",
                "provider": "evolutionlive",
                "icon": "https://ossimg.tirangaagent.com/Tiranga/gamelogo/EVO_Video/teenpattitable01.png"
            },
            {
                "id": 327,
                "game_name": "Super Andar Bahar",
                "game_uid": "f7b98e899461bdd49f92afc36b4c0db5",
                "game_type": "CasinoLive",
                "provider": "evolutionlive",
                "icon": "https://ossimg.tirangaagent.com/Tiranga/gamelogo/EVO_Video/AndarBahar000001.png"
            },
            {
                "id": 328,
                "game_name": "Crazy Time",
                "game_uid": "917c0c51d248c33eb058e3210a2e7371",
                "game_type": "CasinoLive",
                "provider": "evolutionlive",
                "icon": "https://ossimg.tirangaagent.com/Tiranga/gamelogo/EVO_Video/CrazyTime0000001.png"
            },
            {
                "id": 329,
                "game_name": "Caribbean Stud Poker",
                "game_uid": "724eebd5cbe7555b01ed60279cb59e5a",
                "game_type": "CasinoLive",
                "provider": "evolutionlive",
                "icon": "https://ossimg.tirangaagent.com/Tiranga/gamelogo/EVO_Video/CSPTable00000001.png"
            },
            {
                "id": 330,
                "game_name": "Triple Card Poker",
                "game_uid": "b7c3b022f1c2b768524523d855a58d89",
                "game_type": "CasinoLive",
                "provider": "evolutionlive",
                "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/evoplay/Triple Card Poker.png"
            },
            {
                "id": 331,
                "game_name": "Auto Lightning Roulette",
                "game_uid": "bad3e93f3faadef550cb11fcb44a49b1",
                "game_type": "CasinoLive",
                "provider": "evolutionlive",
                "icon": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/evoplay/Auto Lightning Roulette.png"
            },
            {
                "id": 332,
                "game_name": "Double Ball Roulette",
                "game_uid": "fae08e8e222f162b27a2d5c4329d1044",
                "game_type": "CasinoLive",
                "provider": "evolutionlive",
                "icon": "https://ossimg.tirangaagent.com/Tiranga/gamelogo/EVO_Video/DoubleBallRou001.png"
            }
        ]
        
        const casino2=[
              {
                "id": 309,
                "game_name": "First Person Mega Ball",
                "game_uid": "3150b1cd8fbbddd94d36f20fab504653",
                "game_type": "CasinoLive",
                "provider": "evolutionlive",
                "icon": "https://games.evolution.com/wp-content/uploads/2023/04/fp_mega_ball_thumbnail_600x840_2023_04.jpg"
            },
            {
                "id": 310,
                "game_name": "First Person Lightning Baccarat",
                "game_uid": "fec1b730e804bf14bd471a1e9b82bf44",
                "game_type": "CasinoLive",
                "provider": "evolutionlive",
                "icon": "https://ossimg.tirangaagent.com/Tiranga/gamelogo/EVO_Video/rng-lbaccarat000.png"
            },
            {
                "id": 311,
                "game_name": "First Person Craps",
                "game_uid": "823245918aa2afd108a5912e363c083c",
                "game_type": "CasinoLive",
                "provider": "evolutionlive",
                "icon": "https://games.evolution.com/wp-content/uploads/2023/04/first_person_craps_thumbnail_600x840_2023_03.jpg"
            },
            {
                "id": 312,
                "game_name": "First Person Baccarat",
                "game_uid": "e18dfa4a5dd4a0f2d8b45337bd6abb9d",
                "game_type": "CasinoLive",
                "provider": "evolutionlive",
                "icon": "https://games.evolution.com/wp-content/uploads/2023/04/first_person_baccarat_thumbnail_600x840_2023_03.jpg"
            },
            {
                "id": 313,
                "game_name": "First Person Golden Wealth Baccarat",
                "game_uid": "88e49e3fb9a9883f01f167d03f5efdcb",
                "game_type": "CasinoLive",
                "provider": "evolutionlive",
                "icon": "https://ossimg.tirangaagent.com/Tiranga/gamelogo/EVO_Video/rng-gwbaccarat00.png"
            },
            {
                "id": 314,
                "game_name": "First Person American Roulette",
                "game_uid": "88b2d98462fbc45d6d31e95083e183df",
                "game_type": "CasinoLive",
                "provider": "evolutionlive",
                "icon": "https://games.evolution.com/wp-content/uploads/2023/04/first_person_american_roulette_thumbnail_600x840_2023_03.jpg"
            },
            {
                "id": 315,
                "game_name": "First Person Deal or No Deal",
                "game_uid": "c715eb06391fabe5275d0b56440f49f3",
                "game_type": "CasinoLive",
                "provider": "evolutionlive",
                "icon": "https://games.evolution.com/wp-content/uploads/2025/03/first_person_deal_or_no_deal_thumbnail_600x840_2025_03.jpg"
            },
            {
                "id": 316,
                "game_name": "First Person Blackjack",
                "game_uid": "4ac0e874a4d5fc55bcdba5302b43bc96",
                "game_type": "CasinoLive",
                "provider": "evolutionlive",
                "icon": "https://games.evolution.com/wp-content/uploads/2023/04/fp_blackjack_thumbnail_600x840_2023_04.jpg"
            }]

const gameListByProvider = async (req, res) => {
  try {
    const { provider = "spribe", page = 1, size = 10 } = req.query;
    if (!provider || !page || !size) {
      return res.status(400).json({
        message: "Undefined page & size",
        status: false,
      });
    }

  if(page==6){
        return res.status(200).json({
        message: "jilli game type successfully.",
        status: true,
        data: {data:jilidata},
      });  
    }
    
    // const response = await axios.get(
    //   `${apiUrl}/getgamedetails?provider=${provider}&page=${page}&size=${size}`
    // );
    const filteredGames = providerData?.filter(
  (game) => game.provider === provider
);

const startIndex = (page - 1) * size;
const paginatedGames = filteredGames.slice(startIndex, startIndex + size);
    
   
      return res.status(200).json({
        message: "get game list successfully.",
        status: true,
        data: {data:paginatedGames},
      });
  
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      status: false,
      error: error.message,
    });
  }
};
const gameListByGameType = async (req, res) => {
  try {
    const { game_type = "CasinoLive", page = 1, size = 20 } = req.query;
    if (!game_type || !page || !size) {
      return res.status(400).json({
        message: "Undefined page & size",
        status: false,
      });
    }
    
  

     const filteredGames = typeAndProviderData?.filter(
  (game) => game.game_type ===game_type
);

const startIndex = (page - 1) * size;
const paginatedGames = filteredGames.slice(startIndex, startIndex + size);


//  const response = await axios.get(
//       `${apiUrl}/getgamedetails?game_type=${game_type}&page=${page}&size=${size}`
//     );
    
    // if (response.data.status) {
    //   return res.status(200).json({
    //     message: "get game type successfully.",
    //     status: true,
    //     data: response.data,
    //   });
    
      return res.status(200).json({
        message: "get game type successfully.",
        status: true,
        data: {data:paginatedGames},
      });
      
      
      
      
      
 
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      status: false,
      error: error.message,
    });
  }
};

const gameListByGameTypeAndProvider = async (req, res) => {
  try {
    const { provider, game_type, page, size } = req.query;
    if (!provider || !game_type || !page || !size) {
      return res.status(400).json({
        message: "Undefined page & size",
        status: false,
      });
    }
    
    
      if(page==2 && provider==="evolutionlive"){
        return res.status(200).json({
        message: "all game type successfully.",
        status: true,
        data: {data:casino2},
      });  
    }
      if(page==3 && provider==="evolutionlive"){
        return res.status(200).json({
        message: "all game type successfully.",
        status: true,
        data: {data:casino3},
      });  
    }
    
      if(page==4 && provider==="evolutionlive"){
        return res.status(200).json({
        message: "all game type successfully.",
        status: true,
        data: {data:casino4},
      });  
    }
    
      if(page==10 && provider==="evolutionlive"){
        return res.status(200).json({
        message: "all game type successfully.",
        status: true,
        data: {data:casino10},
      });  
    }
    
const filteredGames = typeAndProviderData?.filter(
  (game) => game.provider === provider && game.game_type === game_type
);


const startIndex = (page - 1) * size;
const paginatedGames = filteredGames.slice(startIndex, startIndex + size);

//   const response = await axios.get(
//       `${apiUrl}/getgamedetails?provider=${provider}&game_type=${game_type}&page=${page}&size=${size}`
//     );

      return res.status(200).json({
        message: "get game type successfully.",
        status: true,
        data: {data:paginatedGames},
      });
      
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      status: false,
      error: error.message,
    });
  }
};

const gameHistory = async (req, res) => {
  try {
    const { page, size } = req.body;
    const playerid = req.params.id;
    if (!page || !size) {
      return res.status(400).json({
        message: "Undefined page & size",
        status: false,
      });
    }

    const payload = {
      playerid,
      page,
      size,
      uid: "e333695bcff28acdbecc641ae6ee2b23",
      key,
    };

    const response = await axios.post(`${apiUrl}/history`, payload);

    if (response.data.status) {
      return res.status(200).json({
        message: "get game type successfully.",
        status: true,
        data: response.data,
      });
    } else {
      return res.status(500).json({
        message: "Internal server error",
        status: false,
      });
    }
  } catch (error) {
    // console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      status: false,
      error: error.message,
    });
  }
};




module.exports = {
  checkBalance,
  transferBalance,
  launchGame,
  getgamedetails,
  gameProvider,
  gameType,
  gameListByProvider,
  gameListByGameType,
  gameListByGameTypeAndProvider,
  gameHistory,
};
