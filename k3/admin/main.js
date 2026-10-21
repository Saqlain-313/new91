/* =========================================================
   GLOBAL SOCKET — sirf EK BAAR (page load par)
   ========================================================= */
window.SOCKET = window.SOCKET || io({
    withCredentials: true,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000
});

const socket = window.SOCKET; // alias

socket.on('connect', () => console.log('✅ Socket connected:', socket.id));
socket.on('disconnect', (r) => console.warn('❌ Socket disconnected:', r));
socket.on('connect_error', (e) => console.error('❌ Socket error:', e.message));

/* =========================================================
   PAGE LOAD / INIT
   ========================================================= */
$(window).on('load', function () {
    setTimeout(() => {
        $('#preloader').fadeOut(0);
    }, 100);
});

$(document).ready(function () {
    $(`a[href="${window.location.pathname}"]`).addClass('active');
    $(`a[href="${window.location.pathname}"]`).css('pointerEvents', 'none');

    const defaultGame = Number($('html').attr('data-change') || 1);
    connectK3Timer(defaultGame);
});

$('.back-to-tops').click(function () {
    $('html, body').animate({ scrollTop: 0 }, 800);
    return false;
});

/* =========================================================
   HELPERS
   ========================================================= */
const isNumber = (params) => /^[0-9]*\d$/.test(params);

function formatMoney(amount, separator = ',') {
    if (typeof amount !== 'number') amount = Number(amount);
    if (isNaN(amount)) return '';
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

/* =========================================================
   K3 TIMER — same socket, sirf listener switch
   ========================================================= */
let currentTimerEvent = null;

function connectK3Timer(checkID) {
    checkID = Number(checkID);

    let eventName = '';
    if (checkID === 5)       eventName = 'timeUpdate_5';
    else if (checkID === 3)  eventName = 'timeUpdate_3';
    else if (checkID === 1)  eventName = 'timeUpdate_11';
    else if (checkID === 10) eventName = 'timeUpdate_30';
    else return;

    if (currentTimerEvent === eventName) return; // same game, skip

    // purana listener hatao (socket disconnect NAHI)
    if (currentTimerEvent) {
        socket.off(currentTimerEvent);
    }

    currentTimerEvent = eventName;

    // naya listener same socket par
    socket.on(eventName, (data) => {
        if (!data) return;
        const { minute, secondtime1, secondtime2 } = data;
        $('.time-sub[data-role="minute1"]').text(minute);
        $('.time-sub[data-role="minute2"]').text(0);
        $('.time-sub[data-role="sec1"]').text(secondtime1);
        $('.time-sub[data-role="sec2"]').text(secondtime2);
    });

    console.log('🎯 Timer listener:', eventName);
}

/* =========================================================
   RENDER: LIST ORDER
   ========================================================= */
function showListOrder(datas) {
    let html = '';
    datas.map((data) => {
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
                    <span>${(total >= 3 && total <= 10) ? "Small" : "Big"}</span>
                </div>
            </div>
            <div class="van-col van-col--5">
                <div class="c-tc goItem">
                    <span>${(total % 2 === 0) ? "Even" : "Odd"}</span>
                </div>
            </div>
        </div>`;
    });
    $('#list-orders').html(html);
}

/* =========================================================
   RENDER: CHAT MESSAGES (bulk from AJAX)
   ========================================================= */
function messNewJoin2(datas) {
    let result = '';
    datas.map((data) => {
        const map = {
            'total':      `Join Total (${data.bet}) with the Amount of money ${data.money}`,
            'three-same': `Join 3 same numbers(${data.bet}) with the Amount of money ${data.money}`,
            'two-same':   `Join 2 same numbers(${data.bet}) with the Amount of money ${data.money}`,
            'unlike':     `Join another number(${data.bet}) with the Amount of money ${data.money}`
        };
        if (map[data.typeGame]) {
            result += `
                <div class="direct-chat-infos clearfix mt-2">
                    <span class="direct-chat-name float-left"></span>
                </div>
                <img class="direct-chat-img" src="/images/myimg.png" alt="user">
                <div class="direct-chat-text" style="background-color:#1eb93d">${map[data.typeGame]}</div>`;
        }
    });
    $('.direct-chat-msg').html(result);
    $(".direct-chat-warning .direct-chat-messages").animate({
        scrollTop: $(".direct-chat-msg").prop("scrollHeight")
    }, 750);
}

/* =========================================================
   RENDER: TOTAL MONEY (bulk from AJAX)
   ========================================================= */
function messNewJoin3(datas) {
    let total = 0, twoSame = 0, threeSame = 0, unlike = 0;
    datas.map((data) => {
        let money = parseInt(data.money, 10) || 0;
        if (data.typeGame === "total")      total += money;
        if (data.typeGame === "two-same")   twoSame += money;
        if (data.typeGame === "three-same") threeSame += money;
        if (data.typeGame === "unlike")     unlike += money;
    });
    $('#total').attr('totalMoney', total).text(total);
    $('#2-so-trung').attr('totalMoney', twoSame).text(twoSame);
    $('#3-so-trung').attr('totalMoney', threeSame).text(threeSame);
    $('#khac-so').attr('totalMoney', unlike).text(unlike);
}

/* =========================================================
   AJAX: LIST ORDERS
   ========================================================= */
function callListOrder() {
    let game = $('html').attr('data-change');
    $.ajax({
        type: "POST",
        url: "/api/webapi/admin/k3/listOrders",
        data: { gameJoin: game },
        dataType: "json",
        success: function (response) {
            showListOrder(response.data.gameslist);
            messNewJoin2(response.bet);
            messNewJoin3(response.bet);

            let settings = response.settings[0];
            if (game == 1)  $('#ketQua').text('next result: ' + `${(settings.k3d   == '-1') ? 'Random' : settings.k3d}`);
            if (game == 3)  $('#ketQua').text('next result: ' + `${(settings.k3d3  == '-1') ? 'Random' : settings.k3d3}`);
            if (game == 5)  $('#ketQua').text('next result: ' + `${(settings.k3d5  == '-1') ? 'Random' : settings.k3d5}`);
            if (game == 10) $('#ketQua').text('next result: ' + `${(settings.k3d10 == '-1') ? 'Random' : settings.k3d10}`);

            $(".reservation-chunk-sub-num").text(response.period);
            $('#preloader').fadeOut(0);
        }
    });
}

setInterval(callListOrder, 2000);
callListOrder();

/* =========================================================
   SOCKET: SINGLE BET EVENT (real-time append)
   ========================================================= */
function messNewJoin(data) {
    let game = $('html').attr('data-change');
    if (data.change == 1) return;
    if (data.game != game) return;

    let typeGame = '';
    if (data.gameJoin == 1) typeGame = 'total';
    if (data.gameJoin == 2) typeGame = 'two-same';
    if (data.gameJoin == 3) typeGame = 'three-same';
    if (data.gameJoin == 4) typeGame = 'unlike';

    const amt = Number(data.money) * Number(data.xvalue);
    const map = {
        'total':      `Join Total(${data.listJoin}) with the Amount of money ${amt}`,
        'three-same': `Join 3 same numbers(${data.listJoin}) with the Amount of money ${amt}`,
        'two-same':   `Join 2 same numbers(${data.listJoin}) with the Amount of money ${amt}`,
        'unlike':     `Join another number(${data.listJoin}) with the Amount of money ${amt}`
    };
    if (!map[typeGame]) return;

    $('.direct-chat-msg').append(`
        <div class="direct-chat-infos clearfix mt-2">
            <span class="direct-chat-name float-left"></span>
        </div>
        <img class="direct-chat-img" src="/images/myimg.png" alt="user">
        <div class="direct-chat-text" style="background-color:#1eb93d">${map[typeGame]}</div>
    `);

    $(".direct-chat-warning .direct-chat-messages").animate({
        scrollTop: $(".direct-chat-msg").prop("scrollHeight")
    }, 750);
}

/* =========================================================
   SOCKET: TOTAL MONEY UPDATE (real-time increment)
   ========================================================= */
function messNewJoin5(data) {
    let game = $('html').attr('data-change');
    if (data.change == 1) return;
    if (data.game != game) return;

    let typeGame = "";
    if (data.gameJoin == 1) typeGame = "total";
    if (data.gameJoin == 2) typeGame = "two-same";
    if (data.gameJoin == 3) typeGame = "three-same";
    if (data.gameJoin == 4) typeGame = "unlike";

    const add = Number(data.money) * Number(data.xvalue);

    const bump = (sel) => {
        let money = Number($(sel).attr('totalMoney') || 0) + add;
        $(sel).attr('totalMoney', money).text(money);
    };

    if (typeGame == "total")      bump('#total');
    if (typeGame == "two-same")   bump('#2-so-trung');
    if (typeGame == "three-same") bump('#3-so-trung');
    if (typeGame == "unlike")     bump('#khac-so');
}

/* =========================================================
   SOCKET LISTENERS — SINGLE MERGED HANDLER
   ========================================================= */
socket.on("data-server-k3", function (msg) {
    if (!msg) return;

    callListOrder();
    $('.direct-chat-msg').html('');

    messNewJoin(msg);
    messNewJoin5(msg);
});

/* =========================================================
   GAME SWITCH
   ========================================================= */
$('#manage .col-12').click(async function (e) {
    e.preventDefault();
    $('#preloader').fadeIn(0);

    let game = $(this).attr('data');
    $('html').attr('data-change', game);

    connectK3Timer(Number(game));

    await callListOrder();

    $('#manage .col-12').removeClass('block-click');
    $(this).addClass('block-click');
    $('#manage .col-12').find('.info-box-content').removeClass('active-game');
    $(this).find('.info-box-content').addClass('active-game');
});