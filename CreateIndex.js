var fs = require("fs");

module.exports = function createDocIndex(){
  let rawdata = fs.readFileSync(`docs.json`);  
  let obj = JSON.parse(rawdata);
  let sections = obj.sections;
  let indexBody = "";
  for(sect in sections){
    let indexSection = `<a href="#${sect}" class="list-group-item list-group-item-action">${sections[sect].text}</a>`
    if(Object.keys(sections[sect].subsections).length){
      let subsectionBody = '';
      let subsections = sections[sect].subsections
      for(sub in subsections){
        subsectionBody += `<a href="#${sub}"><span>${subsections[sub]}</span></a>`
      }
      indexSection = `
      <div class="dropdown list-group-item p-0">
        <button class="dropbtn" name="intro-dropdown">${sections[sect].text}
          <i class="fa fa-caret-down"></i>
        </button>
        <div class="dropdown-content" id="intro-dropdown">
          ${subsectionBody}
        </div>
      </div>
      `
    }
    indexBody += indexSection;
  }
  let docIndex = `
  <div class="mobibar" id="sidebar-wrapper">
    <div>
      <div class="list-group list-group-flush">
      ${indexBody}
      </div>
    </div>
  </div>
  `;
  console.log(docIndex);
  return docIndex;
}
