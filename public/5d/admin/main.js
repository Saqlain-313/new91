// ✅ SHARED SOCKET
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

// ❌ REMOVED: connectsockets() / cownDownTimer() 
// (Timer ab 5d.ejs ke IIFE se chalega)

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
                    &emsp; ${list_kq}
                    <span class="red box-xs"> = </span>
                    <span class="red box-xs" style="font-size:14px"> ${total} </span>
                </div>
            </div>
            <div class="van-col van-col--5">
                <div class="c-tc goItem">
                    <span> ${(total < 23) ? "&emsp;Small" : "&emsp;Big"} </span>
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
function messNewJoin2(datas) {
    let result = '';
    (datas || []).map((data) => {
        let list_join = String(data.bet).split('');
        let list_join2 = String(data.bet);
        let x = Number(data.amount) || 1;
        let total_money = (Number(data.money) * x) * list_join.length;
        
        let label = isNumber(list_join2) ? `( ${list_join2} )` :
                    (list_join2 == 'b') ? 'Big' :
                    (list_join2 == 's') ? 'Small' :
                    (list_join2 == 'c') ? 'Even' : 'Odd';

        result += `
            <div class="direct-chat-infos clearfix mt-2">
                <span class="direct-chat-name float-left"></span>
            </div>
            <img class="direct-chat-img" src="/images/myimg.png" alt="user image">
            <div class="direct-chat-text" style="background-color:#1eb93d">
                Join ${label} ${total_money}
            </div>`;
    });
    $('.direct-chat-msg').html(result);
    $(".direct-chat-warning .direct-chat-messages").animate({
        scrollTop: $(".direct-chat-msg").prop("scrollHeight")
    }, 750);
}

// ================= UPDATE JOIN CARDS (FIXED) =================
function messNewJoin3(datas) {
    // 🔴 FIX: Uppercase B and S for HTML matching
    let arr = ['b', 's', 'c', 'l', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    // Reset all cards
    for (let i = 0; i < arr.length; i++) {
        let id = (arr[i] === 'b') ? 'B' : (arr[i] === 's') ? 'S' : arr[i];
        $(`#${id}`).attr('totalMoney', 0).text('0');
    }
    
    // Calculate and update
    (datas || []).map((data) => {
        let bet = String(data.bet).split('');
        for (let i = 0; i < bet.length; i++) {
            let char = bet[i].toLowerCase(); // handle b/s safely
            let id = (char === 'b') ? 'B' : (char === 's') ? 'S' : char;
            
            let total_money = Number(data.money) / Number(bet.length);
            let current = Number($(`#${id}`).attr('totalMoney')) || 0;
            
            $(`#${id}`).attr('totalMoney', current + total_money);
            $(`#${id}`).text(formatMoney(current + total_money));
        }
    });
}

// ================= ORDER POLLING =================
const intervalId = setInterval(callListOrder, 2000);

function callListOrder() {
    let game = $('html').attr('data-change');
    $.ajax({
        type: "POST",
        url: "/api/webapi/admin/5d/listOrders",
        data: { gameJoin: game },
        dataType: "json",
        success: function (response) {
            if (!response || !response.data) return;
            showListOrder(response.data.gameslist || []);
            messNewJoin2(response.bet || []);
            messNewJoin3(response.bet || []);

            const settings = (response.settings && response.settings[0]) || {};
            const nextMap = { '1': 'k5d', '3': 'k5d3', '5': 'k5d5', '10': 'k5d10' };
            const key = nextMap[String(game)];
            if (key) {
                $('#ketQua').text('Next Result: ' + (settings[key] == '-1' ? 'Random' : settings[key]));
            }
            $(".reservation-chunk-sub-num").text(response.period);
            $('#preloader').fadeOut(0);
        }
    });
}
callListOrder();

// ================= SOCKET LISTENERS =================
socket.on("data-server-5d", function (msg) {
    if (msg) {
        callListOrder();
        $('.direct-chat-msg').html('');
    }
});

function messNewJoin(data) {
    let game = $('html').attr('data-change');
    if (data.change == 1) return;
    if (String(data.game) != String(game)) return;

    let list_join2 = String(data.list_join);
    let x = Number(data.x) || 1;
    let total_money = (Number(data.money) * x) * list_join2.split('').length;
    
    let label = isNumber(list_join2) ? `( ${list_join2} )` :
                (list_join2 == 'b') ? 'Big' :
                (list_join2 == 's') ? 'Small' :
                (list_join2 == 'c') ? 'Even' : 'Odd';

    let result = `
        <div class="direct-chat-infos clearfix mt-2">
            <span class="direct-chat-name float-left"></span>
        </div>
        <img class="direct-chat-img" src="/images/myimg.png" alt="user image">
        <div class="direct-chat-text" style="background-color:#1eb93d">
            Join ${label} ${total_money}
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

    // Re-fetch list to safely update all cards without math mismatches
    callListOrder();
}

socket.on("data-server-5d", function (msg) {
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