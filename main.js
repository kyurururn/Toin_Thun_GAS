var CHANNEL_ACCESS_TOKEN = "アクセストークン"
var line_endpoint = 'https://api.line.me/v2/bot/message/reply';

function send(m) {
  UrlFetchApp.fetch('https://api.line.me/v2/bot/message/broadcast', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
    },
    payload: JSON.stringify({
      messages: [
        {
            type: 'text',
            text: m
        }
      ]
    }),
  });
}

function doPost(e) {
  var json = JSON.parse(e.postData.contents);

  var reply_token= json.events[0].replyToken;
  if (typeof reply_token === 'undefined') {
    return;
  }

  return;

  var message = json.events[0].message.text;
  var reply;
  if(message.match("桐蔭")){
    if(message.match("中")){
      reply = "https://www.toin-h.wakayama-c.ed.jp/toinjhs/";
    }else{
      reply = "https://www.toin-h.wakayama-c.ed.jp/";
    }
  }else{
    return;
  }

  UrlFetchApp.fetch(line_endpoint, {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'replyToken': reply_token,
      'messages': [{
        'type': 'text',
        'text': reply,
      }],
    }),
  });
  return ContentService.createTextOutput(JSON.stringify({'content': 'post ok'})).setMimeType(ContentService.MimeType.JSON);
}


function check(){
  const URL_HS  = "https://www.toin-h.wakayama-c.ed.jp/";
  const URL_JHS = "https://www.toin-h.wakayama-c.ed.jp/toinjhs/";

  let response_HS  = UrlFetchApp.fetch(URL_HS);
  let response_JHS = UrlFetchApp.fetch(URL_JHS);

  let html_HS  = response_HS.getContentText("UTF-8").split("\n");
  let html_JHS = response_JHS.getContentText("UTF-8").split("\n");

  let html_HS_TOPIC      = -1;
  let html_HS_TOPIC_URL  = "";
  let html_HS_INFO       = -1;
  let html_JHS_TOPIC     = -1;
  let html_JHS_TOPIC_URL = "";
  let html_JHS_INFO      = -1;

  for(let i = 0; i < html_HS.length; i++){
    if(html_HS[i].match(/topics_main/) && html_HS_TOPIC < 0){
      while(!html_HS[i].match(/topics_title/)){
        i++;
      }
      html_HS_TOPIC = i;
      while(!html_HS[i].match(/topics_more/)){
        i++;
      }
      while(!html_HS[i].match(/a href/)){
        i++;
      }
      html_HS_TOPIC_URL = i;
    }else if(html_HS[i].match(/info_main/) && html_HS_INFO < 0){
      while(!html_HS[i].match(/info_title/)){
        i++;
      }
      html_HS_INFO = i;
    }
  }

  for(let i = 0; i < html_JHS.length; i++){
    if(html_JHS[i].match(/topics_main/) && html_JHS_TOPIC < 0){
      while(!html_JHS[i].match(/topics_title/)){
        i++;
      }
      html_JHS_TOPIC = i;
      while(!html_JHS[i].match(/topics_more/)){
        i++;
      }
      while(!html_JHS[i].match(/a href/)){
        i++;
      }
      html_JHS_TOPIC_URL = i;
    }else if(html_JHS[i].match(/info_main/) && html_JHS_INFO < 0){
      while(!html_JHS[i].match(/info_title/)){
        i++;
      }
      html_JHS_INFO = i;
    }
  }

  html_HS_TOPIC      = html_HS[html_HS_TOPIC].substring(html_HS[html_HS_TOPIC].indexOf(">")+1,html_HS[html_HS_TOPIC].indexOf("/p")-1);
  html_JHS_TOPIC     = html_JHS[html_JHS_TOPIC].substring(html_JHS[html_JHS_TOPIC].indexOf(">")+1,html_JHS[html_JHS_TOPIC].indexOf("/p")-1);

  html_HS_INFO       = html_HS[html_HS_INFO].substring(html_HS[html_HS_INFO].indexOf(">")+1,html_HS[html_HS_INFO].indexOf("/p")-1);
  html_JHS_INFO      = html_JHS[html_JHS_INFO].substring(html_JHS[html_JHS_INFO].indexOf(">")+1,html_JHS[html_JHS_INFO].indexOf("/p")-1);

  html_HS_TOPIC_URL  = html_HS[html_HS_TOPIC_URL].substring(html_HS[html_HS_TOPIC_URL].indexOf("href")+6,html_HS[html_HS_TOPIC_URL].indexOf("img")-3);
  html_JHS_TOPIC_URL = html_JHS[html_JHS_TOPIC_URL].substring(html_JHS[html_JHS_TOPIC_URL].indexOf("href")+6,html_JHS[html_JHS_TOPIC_URL].indexOf("img")-3);

  const spreadSheet = SpreadsheetApp.openById("スプレッドシートのID");

  let before = [spreadSheet.getRange("A1").getValue(),spreadSheet.getRange("B1").getValue(),spreadSheet.getRange("C1").getValue(),spreadSheet.getRange("D1").getValue()];

  let after  = [html_HS_TOPIC,html_HS_INFO,html_JHS_TOPIC,html_JHS_INFO];
  
  spreadSheet.getRange("A1").setValue(html_HS_TOPIC);
  spreadSheet.getRange("B1").setValue(html_HS_INFO);
  spreadSheet.getRange("C1").setValue(html_JHS_TOPIC);
  spreadSheet.getRange("D1").setValue(html_JHS_INFO);

  if(before[0] != after[0]){
    send(after[0] + "\nhttps://www.toin-h.wakayama-c.ed.jp/" + html_HS_TOPIC_URL);
  }
  if(before[1] != after[1]){
    //send(after[1] + "\nhttps://www.toin-h.wakayama-c.ed.jp/");
  }
  if(before[2] != after[2]){
    send(after[2] + "\nhttps://www.toin-h.wakayama-c.ed.jp/toinjhs/" + html_JHS_TOPIC_URL);
  }
  if(before[3] != after[3]){
    //send(after[3] + "\nhttps://www.toin-h.wakayama-c.ed.jp/toinjhs/");
  }
}
