let CHANNEL_ACCESS_TOKEN = ["{CHANNEL_ACCESS_TOKEN}"];

const setting = () => {
  let scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperty("LATEST_JHS","感染症関係書類をまとめました。(令和5年1月10日)");
  scriptProperties.setProperty("LATEST_HS","３学期終業式を行いました。（令和5年3月24日）");
  Logger.log(CHANNEL_ACCESS_TOKEN)
}

const show = () => {
  let scriptProperties = PropertiesService.getScriptProperties();
  console.log(scriptProperties.getProperty("LATEST_HS"));
  console.log(scriptProperties.getProperty("LATEST_JHS"));
}

const follower = () => {
  let data = UrlFetchApp.fetch("https://api.line.me/v2/bot/insight/followers?date=20230325",{
    method:"get",
    headers:{
      "Authorization":"Bearer " + CHANNEL_ACCESS_TOKEN[0]
    }
  });
  Logger.log(data);
}


const send = (messages) => {
  for(let i = 0; i < CHANNEL_ACCESS_TOKEN.length; i++){
    for(let j = 0; j < messages.length; j++){
      UrlFetchApp.fetch("https://api.line.me/v2/bot/message/broadcast",{
        method:"post",
        headers:{
          "Content-Type":"application/json",
          "Authorization":"Bearer " + CHANNEL_ACCESS_TOKEN[i],
        },
        payload: JSON.stringify({
          messages: [
            {
                type: 'text',
                text: messages[j]
            }
          ]
        })
      })
    }
  }
}

const check = () => {
  let scriptProperties = PropertiesService.getScriptProperties();

  let latest_hs  = scriptProperties.getProperty("LATEST_HS");
  let latest_jhs = scriptProperties.getProperty("LATEST_JHS");
 
  const URL_HS  = "https://www.toin-h.wakayama-c.ed.jp/";
  const URL_JHS = "https://www.toin-h.wakayama-c.ed.jp/toinjhs/";

  let response_HS  = UrlFetchApp.fetch(URL_HS);
  let response_JHS = UrlFetchApp.fetch(URL_JHS);

  let html_HS  = response_HS.getContentText("UTF-8").split("\n");
  let html_JHS = response_JHS.getContentText("UTF-8").split("\n");

  let titles_hs  = [];
  let titles_jhs = [];
  let urls_hs    = [];
  let urls_jhs   = [];
  for(let i = 0; i < html_HS.length; i++){
    if(html_HS[i].match(/topics_title/)){
      let title = html_HS[i].trim();
      title = title.replace("<p class='topics_title'>","");
      title = title.replace("</p>","");
      
      if(latest_hs == title){
        break;
      }
      
      titles_hs.push(title);
    }

    if(html_HS[i].match(/topics_more/)){
      let url = html_HS[i+1].trim();
      url = url.replace("<a href='","");
      url = url.replace("'><img src='./img/more_info.gif' alt='詳細' /></a>","");

      urls_hs.push(URL_HS + url);
    }
  }

  for(let i = 0; i < html_JHS.length; i++){
    if(html_JHS[i].match(/topics_title/)){
      let title = html_JHS[i].trim();
      title = title.replace("<p class='topics_title'>","");
      title = title.replace("</p>","");
      
      if(latest_jhs == title){
        break;
      }
      
      titles_jhs.push(title);
    }

    if(html_JHS[i].match(/topics_more/)){
      let url = html_JHS[i+1].trim();
      url = url.replace("<a href='","");
      url = url.replace("'><img src='./img/more_info.gif' alt='詳細' /></a>","");

      urls_jhs.push(URL_JHS + url);
    }
  }

  let messages = [];

  if(titles_hs.length >= 1 && titles_hs.length <= 3){
    scriptProperties.setProperty("LATEST_HS",titles_hs[0]);

    for(let i = 0; i < titles_hs.length; i++){
      messages.push(titles_hs[i] + "\n" + urls_hs[i]);
    }
  }

  if(titles_jhs.length >= 1 && titles_jhs.length <= 3){
    scriptProperties.setProperty("LATEST_JHS",titles_jhs[0]);

    for(let i = 0; i < titles_jhs.length; i++){
      messages.push(titles_jhs[i] + "\n" + urls_jhs[i]);
    }
  }

  if(messages.length >= 1){
    messages.reverse()
    send(messages)
  }
}
