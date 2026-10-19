$(window).on("load", function () {
  setTimeout(() => {
    $("#preloader").fadeOut(0);
  }, 100);
});
$(document).ready(function () {
  $(`a[href="${window.location.pathname}"]`).addClass("active");
  $(`a[href="${window.location.pathname}"]`).css("pointerEvents", "none");
});

$(".back-to-tops").click(function () {
  $("html, body").animate(
    {
      scrollTop: 0,
    },
    800
  );
  return false;
});

function formatMoney(money) {
  return String(money).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
}

let checkID = $("html").attr("data-change");
let i = 0;
// if(checkID == 11) i = 1;
// if(checkID == 22) i = 3;
// if(checkID == 33) i = 5;
// if(checkID == 44) i = 10;
// function cownDownTimer() {
//     var countDownDate = new Date("2030-07-16T23:59:59.9999999+01:00").getTime();
//     setInterval(function () {
//         var now = new Date().getTime();
//         var distance = countDownDate - now;
//         var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
//         var minute = Math.ceil(minutes % i);
//         var seconds1 = Math.floor((distance % (1000 * 60)) / 10000);
//         var seconds2 = Math.floor(((distance % (1000 * 60)) / 1000) % 10);
//         if(checkID != 1) {
//             $(".time .time-sub:eq(1)").text(minute);
//         }

//         $(".time .time-sub:eq(2)").text(seconds1);
//         $(".time .time-sub:eq(3)").text(seconds2);
//     }, 0);
// }

// cownDownTimer();

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

    sockets.on(eventName, (data) => {
      if (!data) return;

      const { minute, secondtime1, secondtime2 } = data;

   
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
  if (checkID == 33) {
    setupsockets("timeUpdate_5");
  }
  if (checkID == 22) {
    setupsockets("timeUpdate_3");
  }
  if (checkID == 11) {
    setupsockets("timeUpdate_11");
  }
  if (checkID == 44) {
    setupsockets("timeUpdate_10");
  }
}

// Usage example
const typeid1 = 5; // Change this based on your needs
const host = window.location.hostname
const activeVoice = true; // or false, depending on your needs

// Call the function to establish the sockets connection
connectsockets(checkID, host);

// Cleanup when necessary
window.addEventListener("unload", () => {
  if (sockets) {
    sockets.disconnect(); // Disconnect sockets on page unload
  }
});
