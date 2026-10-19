$(document).ready(function () {
  const currentPath = window.location.pathname;
  $(`a[href="${currentPath}"]`)
    .addClass("active")
    .css("pointer-events", "none");
});

$(".back-to-tops").click(function () {
  $("html, body").animate({ scrollTop: 0 }, 800);
  return false;
});

function formatMoney(money) {
  return String(money).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
}

let checkID = $("html").attr("data-change");
let i = 0;


let sockets = null;
let intervalRef = null;

function connectsockets(checkID, host) {
  // Clear any existing interval
  if (intervalRef) {
    clearInterval(intervalRef);
  }

  if (sockets) {
    sockets.disconnect(); // Ensure previous sockets is disconnected
  }

  const setupsockets = (eventName) => {
    sockets = io.connect(host); // Connect to the server
    // //console.log("iuiji", sockets);
    sockets.on(eventName, (data) => {
    //   //console.log("dara", data);
      if (!data) return;

      const { minute, secondtime1, secondtime2 } = data;

    //   console.log(
    //     `Minute: ${minute}, Second Time 1: ${secondtime1}, Second Time 2: ${secondtime2}`
    //   );

      $(".time .time-sub:eq(1)").text(minute);
      $(".time .time-sub:eq(2)").text(secondtime1); // Dividing seconds1 by 10 to simulate the original logic
      $(".time .time-sub:eq(3)").text(secondtime2);
      // Handle open time logic
    });

    // Clean up sockets listener on disconnection
    return () => {
      sockets.off(eventName);
      sockets.disconnect();
    };
  };

  // Set up sockets connection based on typeid1
  if (checkID == 3) {
    setupsockets("timeUpdate_5");
  }
  if (checkID == 2) {
    setupsockets("timeUpdate_3");
  }
  if (checkID == 1) {
    setupsockets("timeUpdate_11");
  }
  if (checkID == 4) {
    setupsockets("timeUpdate_30");
  }
}

// Usage example
const typeid1 = 5; // Change this based on your needs
const host = "https://1xclube.com";
const activeVoice = true; // or false, depending on your needs

// Call the function to establish the sockets connection
connectsockets(checkID, host);

// Cleanup when necessary
window.addEventListener("unload", () => {
  if (sockets) {
    sockets.disconnect(); // Disconnect sockets on page unload
  }
});
