// ✅ SINGLE SHARED SOCKET — EJS timer bhi isi ko use karega
window.appSocket = window.appSocket || io();
const socket = window.appSocket;

$(window).on('load', function () {
    setTimeout(() => {
        $('#preloader').fadeOut(0);
    }, 100);
});

$(document).ready(function () {
    $(`a[href="${window.location.pathname}"]`).addClass('active');
    $(`a[href="${window.location.pathname}"]`).css('pointerEvents', 'none');
});

$('.back-to-tops').click(function () {
    $('html, body').animate({ scrollTop: 0 }, 800);
    return false;
});

const isNumber = (params) => {
    let pattern = /^[0-9]*\d$/;
    return pattern.test(params);
};

function formatMoney(amount, separator = ',') {
    if (typeof amount !== 'number') amount = Number(amount);
    if (isNaN(amount)) return '';
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

// ================= LIST ORDERS DISPLAY =================
function showListOrder(datas) {
    let html = '';
    (datas || []).map((data) => {
        let list_kq = '';
        let total = 0;
        String(data.result).split('').forEach((e) => {
            total += Number(e);
            list_kq += `<span class="red box-xs"> ${e} </span>`;
        });
        html += `
        <div class="c-tc item van-row">
            <div class="van-col van-col--8">
                <div class="c-tc goItem">${data.period}</div>
            </div>
            <div class="van-col van-col--5">
                <div class="c-tc goItem" style="display:flex;justify-content:center;">
                    ${list_kq}
                    <span class="red box-xs"> = </span>
                    <span class="red box-xs" style="font-size:14px"> ${total} </span>
                </div>
            </div>
            <div class="van-col van-col--5">
                <div class="c-tc goItem">
                    <span> ${(total >= 3 && total <= 10) ? "Small" : "Big"} </span>
                </div>
            </div>
            <div class="van-col van-col--5">
                <div class="c-tc goItem">
                    <span> ${(total % 2 == 0) ? "Even" : "Odd"} </span>
                </div>
            </div>
        </div>`;
    });
    $('#list-orders').html(html);
}

// ================= BET CHAT MESSAGES =================
const BET_LABELS = {
    'total': 'Join Total',
    'three-same': 'Join 3 same numbers',
    'two-same': 'Join 2 same numbers',
    'unlike': 'Join another number'
};

function messNewJoin2(datas) {
    let result = '';
    (datas || []).map((data) => {
        const label = BET_LABELS[data.typeGame] || 'Join';
        result += `
            <div class="direct-chat-infos clearfix mt-2">
                <span class="direct-chat-name float-left"></span>
            </div>
            <img class="direct-chat-img" src="/images/myimg.png" alt="user image">
            <div class="direct-chat-text" style="background-color:#1eb93d">
                ${label}(${data.bet}) with the A mount of money ${data.money}
            </div>`;
    });
    $('.direct-chat-msg').html(result);
    $(".direct-chat-warning .direct-chat-messages").animate({
        scrollTop: $(".direct-chat-msg").prop("scrollHeight")
    }, 750);
}

// ================= UPDATE JOIN CARDS (0-9, B, S) =================
// 🔴 YEH FUNCTION MISSING THA JO CARDS KE ANDAR VALUE UPDATE KAREGA
function updateJoinCards(datas) {
    // Pehle sabhi cards ko 0 kar dein
    $('.orderNumber').text('0');
    let cardTotals = {};

    // Har ek bet ko check karein aur uske number/card me add karein
    (datas || []).forEach((data) => {
        let type = data.typeGame;
        let betStr = data.bet || "";
        let amount = Number(data.money) || 0;
        let xvalue = Number(data.amount) || 1; // amount = xvalue
        let totalBetAmount = amount * xvalue;

        if (type === 'total') {
            // Total game me '1,2,3,b,s,c,l' sab ho sakta hai
            let bets = betStr.split(',');
            bets.forEach(b => {
                b = b.trim();
                if (b !== "") {
                    cardTotals[b] = (cardTotals[b] || 0) + totalBetAmount;
                }
            });
        } 
        else if (type === 'two-same' || type === 'three-same') {
            // In games me '1,2,3' type numbers hote hain
            let parts = betStr.split('@');
            if (parts[0]) {
                let nums = parts[0].split(',');
                nums.forEach(n => {
                    n = n.trim();
                    if (n !== "") {
                        cardTotals[n] = (cardTotals[n] || 0) + totalBetAmount;
                    }
                });
            }
        }
        // Note: 'unlike' game me 3 alag alag numbers hote hain, 
        // unko 0-9 cards me count karna ya na karna aapki logic par depend karta hai.
    });

    // Ab DOM (Cards) me values update karein
    $('.info-box').each(function () {
        let label = $(this).find('.info-box-icon').text().trim(); // Card ka ID (0, 1, B, S)
        let valToShow = cardTotals[label] || 0;
        
        // Agar value 0 se badi hai to comma format karke dikhayein
        if (valToShow > 0) {
            $(this).find('.orderNumber').text(formatMoney(valToShow));
        }
    });
}

// ================= BET STATS (TOTAL, 2SAME, 3SAME, UNLIKE) =================
function messNewJoin3(datas) {
    let total = 0, twoSame = 0, threeSame = 0, unlike = 0;
    (datas || []).map((data) => {
        const money = parseInt(data.money, 10) || 0;
        if (data.typeGame === "total") {
            total += money;
            $('#total').attr('totalMoney', total).text(total);
        }
        if (data.typeGame === "two-same") {
            twoSame += money;
            $('#2-so-trung').attr('totalMoney', twoSame).text(twoSame);
        }
        if (data.typeGame === "three-same") {
            threeSame += money;
            $('#3-so-trung').attr('totalMoney', threeSame).text(threeSame);
        }
        if (data.typeGame === "unlike") {
            unlike += money;
            $('#khac-so').attr('totalMoney', unlike).text(unlike);
        }
    });
}

// ================= ORDER POLLING =================
const intervalId = setInterval(callListOrder, 2000);

function callListOrder() {
    let game = $('html').attr('data-change');
    $.ajax({
        type: "POST",
        url: "/api/webapi/admin/k3/listOrders",
        data: { gameJoin: game },
        dataType: "json",
        success: function (response) {
            if (!response || !response.data) return;
            
            showListOrder(response.data.gameslist || []);
            
            // 🔴 UPDATE FUNCTIONS CALL KIYE
            messNewJoin2(response.bet || []);
            messNewJoin3(response.bet || []);
            updateJoinCards(response.bet || []); // <--- YEH NAYA ADD HUA HAI

            const settings = (response.settings && response.settings[0]) || {};
            const nextMap = { '1': 'k3d', '3': 'k3d3', '5': 'k3d5', '10': 'k3d10' };
            const key = nextMap[String(game)];
            if (key) {
                $('#ketQua').text('next result: ' + (settings[key] == '-1' ? 'Random' : settings[key]));
            }
            $(".reservation-chunk-sub-num").text(response.period);
            $('#preloader').fadeOut(0);
        }
    });
}
callListOrder();

socket.on("data-server-k3", function (msg) {
    if (msg) {
        callListOrder();
        $('.direct-chat-msg').html('');
    }
});

// ================= NEW JOIN ANIMATION (LIVE) =================
function messNewJoin(data) {
    let game = $('html').attr('data-change');
    if (data.change == 1) return;
    if (String(data.game) != String(game)) return;

    let typeGame = '';
    if (data.gameJoin == 1) typeGame = 'total';
    if (data.gameJoin == 2) typeGame = 'two-same';
    if (data.gameJoin == 3) typeGame = 'three-same';
    if (data.gameJoin == 4) typeGame = 'unlike';

    const label = BET_LABELS[typeGame];
    if (!label) return;

    const result = `
        <div class="direct-chat-infos clearfix mt-2">
            <span class="direct-chat-name float-left"></span>
        </div>
        <img class="direct-chat-img" src="/images/myimg.png" alt="user image">
        <div class="direct-chat-text" style="background-color:#1eb93d">
            ${label}(${data.listJoin}) with the A mount of money ${Number(data.money) * Number(data.xvalue)}
        </div>`;
    $('.direct-chat-msg').append(result);
    $(".direct-chat-warning .direct-chat-messages").animate({
        scrollTop: $(".direct-chat-msg").prop("scrollHeight")
    }, 750);
}

function messNewJoin5(data) {
    let game = $('html').attr('data-change');
    if (data.change == 1) return;
    if (String(data.game) != String(game)) return;

    // (Existing logic is fine for top stats, but we need to update cards too)
    // Force update all data from server when someone joins live
    callListOrder(); 
}

socket.on("data-server-k3", function (msg) {
    if (!msg) return;
    messNewJoin(msg);
    messNewJoin5(msg);
});

// ================= GAME SWITCH =================
$('#manage .col-12').click(async function (e) {
    e.preventDefault();
    $('#preloader').fadeIn(0);
    let game = $(this).attr('data');
    $('html').attr('data-change', game);
    await callListOrder();
    $('#manage .col-12').removeClass('block-click');
    $(this).addClass('block-click');
    $('#manage .col-12').find('.info-box-content').removeClass('active-game');
    $(this).find('.info-box-content').addClass('active-game');
});