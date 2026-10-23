window.appSocket = window.appSocket || io();
const socket = window.appSocket;

function formatMoney(amount, separator = ",") {
  if (typeof amount !== "number") amount = Number(amount);
  if (isNaN(amount)) return "0";
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

// ✅ 5D CARDS UPDATE FUNCTION (TRX Style)
function updateJoinCards5D(datas) {
  // 1. Sabhi top stats ko 0 kar dein
  $("#b").text("0");
  $("#s").text("0");
  $("#l").text("0");
  $("#c").text("0");

  // 2. Sabhi cards (0-9, B, S) ko 0 kar dein
  $(".info-box-number").text("0");

  let totals = { b: 0, s: 0, l: 0, c: 0 };
  let cardTotals = {};

  // 3. Data calculate karein
  (datas || []).forEach((data) => {
    let bet = String(data.bet).toLowerCase();
    let amount = Number(data.money) || 0;

    // String ko characters me split karein (e.g. "12b" -> ['1', '2', 'b'])
    let bets = bet.split("");

    bets.forEach((char) => {
      if (char) {
        // Top Stats (Big, Small, Odd, Even)
        if (["b", "s", "l", "c"].includes(char)) {
          totals[char] += amount;
        }
        // Cards (0-9, B, S)
        let cardKey = char.toUpperCase(); // 'b' -> 'B'
        cardTotals[cardKey] = (cardTotals[cardKey] || 0) + amount;
      }
    });
  });

  // 4. Top Stats update karein
  $("#b").text(formatMoney(totals.b));
  $("#s").text(formatMoney(totals.s));
  $("#l").text(formatMoney(totals.l));
  $("#c").text(formatMoney(totals.c));

  // 5. Cards update karein
  $(".info-box").each(function () {
    // Card ka label nikaalein (0, 1, 2 ... B, S)
    let label = $(this).find(".info-box-icon1").text().trim();
    let searchKey = label.toUpperCase();
    let valToShow = cardTotals[searchKey] || 0;

    // Agar 0 se zyada hai toh update karein
    if (valToShow > 0) {
      $(this).find(".info-box-number").text(formatMoney(valToShow));
    }
  });
}

// ✅ MAIN ORDER FETCH
function callListOrder() {
  let game = $("html").attr("data-change");
  $.ajax({
    type: "POST",
    url: "/api/webapi/admin/5d/listOrders",
    data: { gameJoin: game },
    dataType: "json",
    success: function (response) {
      if (!response || !response.data) return;

      // History List Update
      let html = "";
      (response.data.gameslist || []).forEach((data) => {
        let sum = String(data.result)
          .split("")
          .reduce((a, b) => a + Number(b), 0);
        html += `<div class="c-tc item van-row">
                    <div class="van-col van-col--8"><div class="c-tc goItem">${data.period}</div></div>
                    <div class="van-col van-col--5"><div class="c-tc goItem">${data.result} = ${sum}</div></div>
                    <div class="van-col van-col--5"><div class="c-tc goItem">${sum < 23 ? "Small" : "Big"}</div></div>
                    <div class="van-col van-col--5"><div class="c-tc goItem">${sum % 2 === 0 ? "Even" : "Odd"}</div></div>
                </div>`;
      });
      $("#list-orders").html(html);

      // 🔴 CARDS & STATS UPDATE
      updateJoinCards5D(response.bet);

      // Next Result & Period
      if (response.settings && response.settings[0]) {
        let nextMap = { 1: "k5d", 3: "k5d3", 5: "k5d5", 10: "k5d10" };
        let key = nextMap[String(game)];
        if (key)
          $("#ketQua").text(
            "Next Result: " +
              (response.settings[0][key] == "-1"
                ? "Random"
                : response.settings[0][key]),
          );
      }
      $(".reservation-chunk-sub-num").text(response.period);
      $("#preloader").fadeOut(0);
    },
  });
}

// Har 2 second me call karein
setInterval(callListOrder, 2000);
callListOrder();

// Jab koi live bet khele to socket se turant update karein
socket.on("data-server-5d", function (msg) {
  if (msg) callListOrder();
});
