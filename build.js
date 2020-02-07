module.exports = function createFile(file, contents, callback) {
  if(fs.existsSync(file)){
    let err = `file ${file} already exists`
    if(callback && typeof callback === 'function') callback(null, err)
    else return data;
  }
  else {
    fs.writeFile(file, contents, (err) => {
      if (err) {
        if(callback && typeof callback === 'function') callback(new Error(err))
        else throw new Error(err);
      }
      else {
        let data = `Created the ${file} file`
        if(callback && typeof callback === 'function') callback(null, data)
        else return data;
      }
    })
  }
}