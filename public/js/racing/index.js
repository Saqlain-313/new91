
var socket = io();
let typeid = $('html').attr('data-change');
let game = '';
if (typeid == '1') game = 'wingo';
if (typeid == '2') game = 'wingo3';
if (typeid == '3') game = 'wingo5';
if (typeid == '4') game = 'wingo10';
$(`.container-fluid:eq(1) .row:eq(0) .info-box-content:eq(${Number(typeid) - 1}) .info-box-text`).css('color', '#e67e22');

function formatMoney(amount, separator = ',') {
    if (typeof amount !== 'number') {
        amount = Number(amount);
    }

    if (isNaN(amount)) {
        return '';
    }

    // Convert the number to a string and add commas as thousands separators
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}


function formateT(params) {
    let result = (params < 10) ? "0" + params : params;
    return result;
}

function timerJoin(params = '', addHours = 0) {
    let date = '';
        if (params) {
            date = new Date(Number(params));
        } else {
            date = new Date();
        }
    
        date.setHours(date.getHours() + addHours);
    
        let years = formateT(date.getFullYear());
        let months = formateT(date.getMonth() + 1);
        let days = formateT(date.getDate());
    
        let hours = date.getHours() % 12;
        hours = hours === 0 ? 12 : hours;
        let ampm = date.getHours() < 12 ? "AM" : "PM";
    
        let minutes = formateT(date.getMinutes());
        let seconds = formateT(date.getSeconds());
    
        return years + '-' + months + '-' + days + ' ' + hours + ':' + minutes + ':' + seconds + ' ' + ampm;
}
const isNumber = (params) => {
    let pattern = /^[0-9]*\d$/;
    return pattern.test(params);
}

function showJoinMember(datas) {
    let htmlContent = datas.map(data => {
        let phone = data.phone;
        let bet = data.bet;
        let money = data.money;
        let name = data.bet;
        let time = timerJoin(data.time);
        
        return `
          <div class="direct-chat-infos clearfix">
            <span class="direct-chat-name float-left"></span>
            <span class="direct-chat-timestamp float-right text-primary">${time}</span>
          </div>
          <img class="direct-chat-img" src="/images/myimg.png" alt="message user image">
          <div class="direct-chat-text" style="background-color: ${(isNumber(bet)) ? '#007acc' : (bet == 'x') ? '#1eb93d' : (bet == 'd') ? '#f52828' : (bet == 't') ? '#ea3af0' : (bet == 'l') ? '#ffc511' : '#5cba47'}">
            Join ${((isNumber(bet)) ? bet : (bet == 'd') ? 'Red' : (bet == 'x') ? 'Green' : (bet == 't') ? 'Violet' : (bet == 'l') ? 'Big' : 'Small')} ${money}
          </div>`;
    }).join(''); // Combine all the generated HTML strings into one

    $('.direct-chat-msg').html(htmlContent);
}


function showJoinMember2(data) {
    // if (data.change == 1) return;
    let bet = data.join;
    let money = data.money
    let name = data.bet;
    let time = timerJoin(data.time);
    let result = '';
    result += `
      <div class="direct-chat-infos clearfix">
        <span class="direct-chat-name float-left"></span>
        <span class="direct-chat-timestamp float-right text-primary">${time}</span>
      </div>
      <img class="direct-chat-img" src="/images/myimg.png" alt="message user image">
      <div class="direct-chat-text" style="background-color: ${(isNumber(bet)) ? '#007acc' : (bet == 'x') ? '#1eb93d' : (bet == 'd') ? '#f52828' : (bet == 't') ? '#ea3af0' : (bet == 'l') ? '#ffc511' : '#5cba47'}">
        Join ${((isNumber(bet)) ? bet : (bet == 'd') ? 'Red' : (bet == 'x') ? 'Green' : (bet == 't') ? 'Violet' : (bet == 'l') ? 'Big' : 'Small')} ${money}
      </div>`;
    $('.direct-chat-msg').append(result);
}


socket.on("data-server", function (msg) {
    showJoinMember2(msg);
    $(".direct-chat-warning .direct-chat-messages").animate({
        scrollTop: $(".direct-chat-msg").prop("scrollHeight")
    }, 750);
   
    // if (msg.level == 1) return;
    var red = Number($('.orderRed').attr('totalmoney'));
    var green = Number($('.orderViolet').attr('totalmoney'));
    var violet = Number($('.orderGreen').attr('totalmoney'));
    var n0 = Number($('.orderNumber:eq(0)').attr('totalmoney'));
    var n1 = Number($('.orderNumber:eq(1)').attr('totalmoney'));
    var n2 = Number($('.orderNumber:eq(2)').attr('totalmoney'));
    var n3 = Number($('.orderNumber:eq(3)').attr('totalmoney'));
    var n4 = Number($('.orderNumber:eq(4)').attr('totalmoney'));
    var n5 = Number($('.orderNumber:eq(5)').attr('totalmoney'));
    var n6 = Number($('.orderNumber:eq(6)').attr('totalmoney'));
    var n7 = Number($('.orderNumber:eq(7)').attr('totalmoney'));
    var n8 = Number($('.orderNumber:eq(8)').attr('totalmoney'));
    var n9 = Number($('.orderNumber:eq(9)').attr('totalmoney'));
    var n = Number($('.orderNumber:eq(10)').attr('totalmoney'));
    var l = Number($('.orderNumber:eq(11)').attr('totalmoney'));
    var ns = Number($('.orderNumbers').attr('totalmoney', ns));

 
    if (msg.join == '0') n0 += msg.money - (msg.money * 0.02);
    if (msg.join == '1') n1 += msg.money - (msg.money * 0.02);
    if (msg.join == '2') n2 += msg.money - (msg.money * 0.02);
    if (msg.join == '3') n3 += msg.money - (msg.money * 0.02);
    if (msg.join == '4') n4 += msg.money - (msg.money * 0.02);
    if (msg.join == '5') n5 += msg.money - (msg.money * 0.02);
    if (msg.join == '6') n6 += msg.money - (msg.money * 0.02);
    if (msg.join == '7') n7 += msg.money - (msg.money * 0.02);
    if (msg.join == '8') n8 += msg.money - (msg.money * 0.02);
    if (msg.join == '9') n9 += msg.money - (msg.money * 0.02);
    if (msg.join == 'x') green += msg.money - (msg.money * 0.02);
    if (msg.join == 't') violet += msg.money - (msg.money * 0.02);
    if (msg.join == 'd') red += msg.money - (msg.money * 0.02);
    if (msg.join == 'l') l += msg.money - (msg.money * 0.02);
    if (msg.join == 'n') n += msg.money - (msg.money * 0.02);
    ns = n0 + n1 + n2 + n3 + n4 + n5 + n6 + n7 + n8 + n9;

    $('.orderRed').text(formatMoney(red, ','));
    $('.orderViolet').text(formatMoney(violet, ','));
    $('.orderGreen').text(formatMoney(green, ','));
    $('.orderNumber:eq(0)').text(formatMoney(n0, ','));
    $('.orderNumber:eq(1)').text(formatMoney(n1, ','));
    $('.orderNumber:eq(2)').text(formatMoney(n2, ','));
    $('.orderNumber:eq(3)').text(formatMoney(n3, ','));
    $('.orderNumber:eq(4)').text(formatMoney(n4, ','));
    $('.orderNumber:eq(5)').text(formatMoney(n5, ','));
    $('.orderNumber:eq(6)').text(formatMoney(n6, ','));
    $('.orderNumber:eq(7)').text(formatMoney(n7, ','));
    $('.orderNumber:eq(8)').text(formatMoney(n8, ','));
    $('.orderNumber:eq(9)').text(formatMoney(n9, ','));
    $('.orderNumber:eq(10)').text(formatMoney(l, ','));
    $('.orderNumber:eq(11)').text(formatMoney(n, ','));
    $('.orderNumbers').text(formatMoney(ns, ','));
   
    $('.orderRed').attr('totalmoney', red);
    $('.orderViolet').attr('totalmoney', green);
    $('.orderGreen').attr('totalmoney', violet);
    $('.orderNumber:eq(0)').attr('totalmoney', n0);
    $('.orderNumber:eq(1)').attr('totalmoney', n1);
    $('.orderNumber:eq(2)').attr('totalmoney', n2);
    $('.orderNumber:eq(3)').attr('totalmoney', n3);
    $('.orderNumber:eq(4)').attr('totalmoney', n4);
    $('.orderNumber:eq(5)').attr('totalmoney', n5);
    $('.orderNumber:eq(6)').attr('totalmoney', n6);
    $('.orderNumber:eq(7)').attr('totalmoney', n7);
    $('.orderNumber:eq(8)').attr('totalmoney', n8);
    $('.orderNumber:eq(9)').attr('totalmoney', n9);
    $('.orderNumber:eq(10)').attr('totalmoney', n);
    $('.orderNumber:eq(11)').attr('totalmoney', l);
    $('.orderNumbers').attr('totalmoney', ns);
});

function showListOrder4(list_orders, x) {
    let htmls = "";
    let result = list_orders.map((list_orders) => {
        return (htmls += `
                    <div data-v-a9660e98="" class="c-tc item van-row">
                        <div data-v-a9660e98="" class="van-col van-col--8">
                            <div data-v-a9660e98="" class="c-tc goItem">${list_orders.period}</div>
                        </div>
                        <div data-v-a9660e98="" class="van-col van-col--5">
                            <div data-v-a9660e98="" class="c-tc goItem">
                                <!---->
                                <span data-v-a9660e98="" class="${list_orders.amount % 2 == 0 ? "red" : "green"}"> ${list_orders.amount} </span>
                            </div>
                        </div>
                        <div data-v-a9660e98="" class="van-col van-col--5">
                            <div data-v-a9660e98="" class="c-tc goItem">
                                <span data-v-a9660e98=""> ${list_orders.amount < 5 ? "Small" : "Big"} </span>
                                <!---->
                            </div>
                        </div>
                        <div data-v-a9660e98="" class="van-col van-col--6">
                            <div data-v-a9660e98="" class="goItem c-row c-tc c-row-center">
                                <div data-v-a9660e98="" class="c-tc c-row box c-row-center">
                                    <span data-v-a9660e98="" class="li ${list_orders.amount % 2 == 0 ? "red" : "green"}"></span>
                                    ${list_orders.amount == 0 || list_orders.amount == 5 ? '<span data-v-a9660e98="" class="li violet"></span>' : ""}
                                </div>
                            </div>
                        </div>
                    </div>
                    `);
    });
    $(`#list-orders`).html(htmls);
}


socket.on("data-server", function (msg) {
    // if (msg.data[0].game != game) return;
   
     
   
     
    $(".direct-chat-msg").html('');
    $('.info-box-number').text('0');
    let data1 = msg.data[0]; // lấy ra cầu mới nhất
    //$(".reservation-chunk-sub-num").text(data1.period);
    //console.log("data1.period" , data1.period)
    let data2 = []; // lấy ra cầu cũ
    let data3 = data2.push(msg.data[1]);
    $(".direct-chat-warning .direct-chat-messages").animate({
        scrollTop: $(".direct-chat-msg").prop("scrollHeight")
    }, 750);
    $.ajax({
        type: "POST",
        url: "/api/webapi/admin/racing/totalJoin",
        data: {
            typeid: typeid,
        },
        dataType: "json",
        success: function (response) {
            var red = 0;
            var green = 0;
            var violet = 0;
            var n0 = 0;
            var n1 = 0;
            var n2 = 0;
            var n3 = 0;
            var n4 = 0;
            var n5 = 0;
            var n6 = 0;
            var n7 = 0;
            var n8 = 0;
            var n9 = 0;
            var n = 0;
            var l = 0;
            var ns = 0;
            var length = response.datas.length;
            var datas = response.datas;
            for (let i = 0; i < length; i++) {
                if (datas[i].bet == '0') n0 += parseFloat(datas[i].money);
                if (datas[i].bet == '1') n1 += parseFloat(datas[i].money);
                if (datas[i].bet == '2') n2 += parseFloat(datas[i].money);
                if (datas[i].bet == '3') n3 += parseFloat(datas[i].money);
                if (datas[i].bet == '4') n4 += parseFloat(datas[i].money);
                if (datas[i].bet == '5') n5 += parseFloat(datas[i].money);
                if (datas[i].bet == '6') n6 += parseFloat(datas[i].money);
                if (datas[i].bet == '7') n7 += parseFloat(datas[i].money);
                if (datas[i].bet == '8') n8 += parseFloat(datas[i].money);
                if (datas[i].bet == '9') n9 += parseFloat(datas[i].money);
                if (datas[i].bet == 'x') green += parseFloat(datas[i].money);
                if (datas[i].bet == 't') violet += parseFloat(datas[i].money);
                if (datas[i].bet == 'd') red += parseFloat(datas[i].money);
                if (datas[i].bet == 'l') l += parseFloat(datas[i].money);
                if (datas[i].bet == 'n') n += parseFloat(datas[i].money);
                
            }
            ns = n0 + n1 + n2 + n3 + n4 + n5 + n6 + n7 + n8 + n9;
            $('.orderRed').text(formatMoney(red, ','));
            $('.orderViolet').text(formatMoney(violet, ','));
            $('.orderGreen').text(formatMoney(green, ','));
            $('.orderNumber:eq(0)').text(formatMoney(n0, ','));
            $('.orderNumber:eq(1)').text(formatMoney(n1, ','));
            $('.orderNumber:eq(2)').text(formatMoney(n2, ','));
            $('.orderNumber:eq(3)').text(formatMoney(n3, ','));
            $('.orderNumber:eq(4)').text(formatMoney(n4, ','));
            $('.orderNumber:eq(5)').text(formatMoney(n5, ','));
            $('.orderNumber:eq(6)').text(formatMoney(n6, ','));
            $('.orderNumber:eq(7)').text(formatMoney(n7, ','));
            $('.orderNumber:eq(8)').text(formatMoney(n8, ','));
            $('.orderNumber:eq(9)').text(formatMoney(n9, ','));
            $('.orderNumber:eq(10)').text(formatMoney(l, ','));
            $('.orderNumber:eq(11)').text(formatMoney(n, ','));
            $('.orderNumbers').text(formatMoney(ns, ','));

            $('.orderRed').attr('totalmoney', red);
            $('.orderViolet').attr('totalmoney', violet);
            $('.orderGreen').attr('totalmoney', green);
            $('.orderNumber:eq(0)').attr('totalmoney', n0);
            $('.orderNumber:eq(1)').attr('totalmoney', n1);
            $('.orderNumber:eq(2)').attr('totalmoney', n2);
            $('.orderNumber:eq(3)').attr('totalmoney', n3);
            $('.orderNumber:eq(4)').attr('totalmoney', n4);
            $('.orderNumber:eq(5)').attr('totalmoney', n5);
            $('.orderNumber:eq(6)').attr('totalmoney', n6);
            $('.orderNumber:eq(7)').attr('totalmoney', n7);
            $('.orderNumber:eq(8)').attr('totalmoney', n8);
            $('.orderNumber:eq(9)').attr('totalmoney', n9);
            $('.orderNumber:eq(10)').attr('totalmoney', l);
            $('.orderNumber:eq(11)').attr('totalmoney', n);
            $('.orderNumbers').attr('totalmoney', ns);
        
            
            
            showJoinMember(response.datas);
            
            showListOrder3(response.list_orders);
            $(".direct-chat-warning .direct-chat-messages").animate({
                scrollTop: $(".direct-chat-msg").prop("scrollHeight")
            }, 750);
            //$('.reservation-chunk-sub-num').text(response.lotterys[0].period);
            // //console.log("response.lotterys[0].period" , response.lotterys[0].period);
            let is = ''
            if (typeid == '1') is = $('#ketQua').text(`Next Result: ${(response.setting[0].wingo == '-1') ? 'Random' : response.setting[0].wingo}`);
            if (typeid == '2') is = $('#ketQua').text(`Next Result: ${(response.setting[0].wingo3 == '-1') ? 'Random' : response.setting[0].wingo3}`);
            if (typeid == '3') is = $('#ketQua').text(`Next Result: ${(response.setting[0].wingo5 == '-1') ? 'Random' : response.setting[0].wingo5}`);
            if (typeid == '4') is = $('#ketQua').text(`Next Result: ${(response.setting[0].wingo10 == '-1') ? 'Random' : response.setting[0].wingo10}`);
            
            if (typeid == '1') $('#winrate').text(`Next Result: ${(response.setting[0].bs1 == '-1') ? 'Random' : response.setting[0].bs1}`);
            if (typeid == '2') $('#winrate').text(`Next Result: ${(response.setting[0].bs3 == '-1') ? 'Random' : response.setting[0].bs3}`);
            if (typeid == '3') $('#winrate').text(`Next Result: ${(response.setting[0].bs5 == '-1') ? 'Random' : response.setting[0].bs5}`);
            if (typeid == '4') $('#winrate').text(`Next Result: ${(response.setting[0].bs10 == '-1') ? 'Random' : response.setting[0].bs10}`);
        }
    });
});


function showListOrder3(list_orders, x) {
  let htmls = "";

  list_orders.forEach((order) => {
    // Generate spans for split numbers
    let splitAmountSpans = String(order.amount)
      .split(",")
      .map((item) => {
        return `<span>${item > 4 ? "B" : "S"}</span>`;
      })
      .join(""); // Join the array of spans into a single string
      
       let splitAmountSpans2 = String(order.amount)
      .split(",")
      .map((item) => {
        return `<span>${item%2===0 ? "E" : "O"}</span>`;
      })
      .join(""); // Join the array of spans into a single string
      

    // Add the complete HTML block
    htmls += `
      <div data-v-a9660e98="" class="c-tc item van-row">
        <div data-v-a9660e98="" class="van-col van-col--8">
          <div data-v-a9660e98="" class="c-tc goItem">${order.period}</div>
        </div>
        <div data-v-a9660e98="" class="van-col van-col--5">
          <div data-v-a9660e98="" class="c-tc goItem">
            <span data-v-a9660e98="" class="${order.amount % 2 == 0 ? "red" : "green"}">${order.amount}</span>
          </div>
        </div>
        <div data-v-a9660e98="" class="van-col van-col--5">
          <div data-v-a9660e98="" class="c-tc goItem">
            <span data-v-a9660e98="">${splitAmountSpans}</span>
          </div>
        </div>
        <div data-v-a9660e98="" class="van-col van-col--6">
          <div data-v-a9660e98="" class="goItem c-row c-tc c-row-center">
            <div data-v-a9660e98="" class="c-tc c-row box c-row-center">
             
              ${
                splitAmountSpans2
              }
            </div>
          </div>
        </div>
      </div>
    `;
  });

  // Update the HTML content
  $(`#list-orders`).html(htmls);
}


// Execute myFunction every 2 seconds (2000 milliseconds)


// To stop the interval after a certain time or condition, use clearInterval
// clearInterval(intervalId);

function myFunction() {
    
$.ajax({
        type: "POST",
        url: "/api/webapi/admin/racing/totalJoin",
        data: {
            typeid: typeid,
        },
        dataType: "json",
        success: function (response) {
            
            // //console.log("response" ,response)
            var red = 0;
            var green = 0;
            var violet = 0;
            var n0 = 0;
            var n1 = 0;
            var n2 = 0;
            var n3 = 0;
            var n4 = 0;
            var n5 = 0;
            var n6 = 0;
            var n7 = 0;
            var n8 = 0;
            var n9 = 0;
            var n = 0;
            var l = 0;
            var ns = 0;
            var length = response.datas.length;
            var datas = response.datas;
            for (let i = 0; i < length; i++) {
                if (datas[i].bet == '0') n0 += parseFloat(datas[i].money);
                if (datas[i].bet == '1') n1 += parseFloat(datas[i].money);
                if (datas[i].bet == '2') n2 += parseFloat(datas[i].money);
                if (datas[i].bet == '3') n3 += parseFloat(datas[i].money);
                if (datas[i].bet == '4') n4 += parseFloat(datas[i].money);
                if (datas[i].bet == '5') n5 += parseFloat(datas[i].money);
                if (datas[i].bet == '6') n6 += parseFloat(datas[i].money);
                if (datas[i].bet == '7') n7 += parseFloat(datas[i].money);
                if (datas[i].bet == '8') n8 += parseFloat(datas[i].money);
                if (datas[i].bet == '9') n9 += parseFloat(datas[i].money);
                if (datas[i].bet == 'x') green += parseFloat(datas[i].money);
                if (datas[i].bet == 't') violet += parseFloat(datas[i].money);
                if (datas[i].bet == 'd') red += parseFloat(datas[i].money);
                if (datas[i].bet == 'l') l += parseFloat(datas[i].money);
                if (datas[i].bet == 'n') n += parseFloat(datas[i].money);
                
            }
            ns = n0 + n1 + n2 + n3 + n4 + n5 + n6 + n7 + n8 + n9;
            $('.orderRed').text(formatMoney(red, ','));
            $('.orderViolet').text(formatMoney(violet, ','));
            $('.orderGreen').text(formatMoney(green, ','));
            $('.orderNumber:eq(0)').text(formatMoney(n0, ','));
            $('.orderNumber:eq(1)').text(formatMoney(n1, ','));
            $('.orderNumber:eq(2)').text(formatMoney(n2, ','));
            $('.orderNumber:eq(3)').text(formatMoney(n3, ','));
            $('.orderNumber:eq(4)').text(formatMoney(n4, ','));
            $('.orderNumber:eq(5)').text(formatMoney(n5, ','));
            $('.orderNumber:eq(6)').text(formatMoney(n6, ','));
            $('.orderNumber:eq(7)').text(formatMoney(n7, ','));
            $('.orderNumber:eq(8)').text(formatMoney(n8, ','));
            $('.orderNumber:eq(9)').text(formatMoney(n9, ','));
            $('.orderNumber:eq(10)').text(formatMoney(l, ','));
            $('.orderNumber:eq(11)').text(formatMoney(n, ','));
            $('.orderNumbers').text(formatMoney(ns, ','));

            $('.orderRed').attr('totalmoney', red);
            $('.orderViolet').attr('totalmoney', violet);
            $('.orderGreen').attr('totalmoney', green);
            $('.orderNumber:eq(0)').attr('totalmoney', n0);
            $('.orderNumber:eq(1)').attr('totalmoney', n1);
            $('.orderNumber:eq(2)').attr('totalmoney', n2);
            $('.orderNumber:eq(3)').attr('totalmoney', n3);
            $('.orderNumber:eq(4)').attr('totalmoney', n4);
            $('.orderNumber:eq(5)').attr('totalmoney', n5);
            $('.orderNumber:eq(6)').attr('totalmoney', n6);
            $('.orderNumber:eq(7)').attr('totalmoney', n7);
            $('.orderNumber:eq(8)').attr('totalmoney', n8);
            $('.orderNumber:eq(9)').attr('totalmoney', n9);
            $('.orderNumber:eq(10)').attr('totalmoney', l);
            $('.orderNumber:eq(11)').attr('totalmoney', n);
            $('.orderNumbers').attr('totalmoney', ns);
        
            showJoinMember(response.datas);
            showListOrder3(response.list_orders);
            $(".direct-chat-warning .direct-chat-messages").animate({
                scrollTop: $(".direct-chat-msg").prop("scrollHeight")
            }, 750);
            $('.reservation-chunk-sub-num').text(response.lotterys[0].period);
            // //console.log("response.lotterys[0].period my function", response.lotterys[0].period)
            let is = ''
            if (typeid == '1') is = $('#ketQua').text(`Next Result: ${(response.setting[0].cargame == '-1') ? 'Random' : response.setting[0].cargame}`);
            if (typeid == '2') is = $('#ketQua').text(`Next Result: ${(response.setting[0].cargame3 == '-1') ? 'Random' : response.setting[0].cargame3}`);
            if (typeid == '3') is = $('#ketQua').text(`Next Result: ${(response.setting[0].cargame5 == '-1') ? 'Random' : response.setting[0].cargame5}`);
            if (typeid == '4') is = $('#ketQua').text(`Next Result: ${(response.setting[0].cargame10 == '-1') ? 'Random' : response.setting[0].cargame10}`);
            
            if (typeid == '1') $('#winrate').text(`Next Result: ${(response.setting[0].bs1 == '-1') ? 'Random' : response.setting[0].bs1}`);
            if (typeid == '2') $('#winrate').text(`Next Result: ${(response.setting[0].bs3 == '-1') ? 'Random' : response.setting[0].bs3}`);
            if (typeid == '3') $('#winrate').text(`Next Result: ${(response.setting[0].bs5 == '-1') ? 'Random' : response.setting[0].bs5}`);
            if (typeid == '4') $('#winrate').text(`Next Result: ${(response.setting[0].bs10 == '-1') ? 'Random' : response.setting[0].bs10}`);
        }
    });


}

const intervalId = setInterval(myFunction, 2000);

$('.start-order').click(function (e) {
    e.preventDefault();
    let rawValue = $('#editResult').val(); 
    //console.log("Raw input:", rawValue);

    if (rawValue !== '') {
        let valuesArray = rawValue.split(',')
            .map(v => v.trim())
            .filter(v => /^\d+$/.test(v))     // Keep only numbers
            .map(v => parseInt(v, 10));   // Remove leading zeros
            
            //console.log("valuesArray.length",valuesArray.length)

        if (valuesArray.length !== 3) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'You must enter exactly 3 numeric values!',
            });
            return;
        }

        let uniqueValues = [...new Set(valuesArray)];

        if (uniqueValues.length !== 3) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'All 3 values must be different!',
            });
            return;
        }

        let cleanedValue = uniqueValues.join(','); // Final string

        $.ajax({
            type: "POST",
            url: "/api/webapi/admin/racing/change",
            data: {
                type: 'change-wingo1',
                value: cleanedValue,
                typeid: typeid,
            },
            dataType: "json",
            success: function (response) {
                Swal.fire(
                    'Good job!',
                    `${response.message}`,
                    'success'
                );
                $('#ketQua').text(`Next Result: ${cleanedValue}`);
            }
        });

    } else {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Input cannot be empty!',
        });
    }
});
