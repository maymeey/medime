var http = require('http')
var config = require('config')
var console = require('console')

module.exports.function = function getHospitalDetail (hospital) {

  var detailInfo

  console.log("# Step 1. 시설정보")
  var url = "http://apis.data.go.kr/B551182/medicInsttDetailInfoService/getFacilityInfo"
  + '?serviceKey=' + config.get('serviceKey')
  + '&ykiho=' + hospital.id
  var result = http.getUrl(url, { format: 'xmljs' }).response.body.items.item
  console.log(result)

  var categoryName = result.clCdNm ? result.clCdNm : "-"



  console.log("# Step 2. 세부정보")
  url = "http://apis.data.go.kr/B551182/medicInsttDetailInfoService/getDetailInfo"
    + '?serviceKey=' + config.get('serviceKey')
    + '&ykiho=' + hospital.id
  result = http.getUrl(url, { format: 'xmljs' })
  console.log(result)

  var feature, timeTable
  try {
    result = result.response.body.items.item

    if (result.plcDir !== undefined && result.plcNm !== undefined)
      wayToCome = result.plcNm + ' ' + (result.plcDir).replace(result.plcNm, '')

    timeTable = []

    if ( (result.trmtMonStart !== undefined) && (result.trmtMonEnd !== undefined)) {
      timeTable.push({
        name: "월요일",
        value: (result.trmtMonStart).substring(0,2) + ":" + (result.trmtMonStart).substring(2,4)
        + " ~ " + (result.trmtMonEnd).substring(0,2) + ":" + (result.trmtMonEnd).substring(2,4)
      })
    }

    if ( (result.trmtTueStart !== undefined) && (result.trmtTueEnd !== undefined)) {
      timeTable.push({
        name: "화요일",
        value: (result.trmtTueStart).substring(0,2) + ":" + (result.trmtTueStart).substring(2,4)
        + " ~ " + (result.trmtTueEnd).substring(0,2) + ":" + (result.trmtTueEnd).substring(2,4)
      })
    }

    if ( (result.trmtWedStart !== undefined) && (result.trmtWedEnd !== undefined)) {
      timeTable.push({
        name: "수요일",
        value: (result.trmtWedStart).substring(0,2) + ":" + (result.trmtWedStart).substring(2,4)
        + " ~ " + (result.trmtWedEnd).substring(0,2) + ":" + (result.trmtWedEnd).substring(2,4)
      })
    }

    if ( (result.trmtThuStart !== undefined) && (result.trmtThuEnd !== undefined)) {
      timeTable.push({
        name: "목요일",
        value: (result.trmtThuStart).substring(0,2) + ":" + (result.trmtThuStart).substring(2,4)
        + " ~ " + (result.trmtThuEnd).substring(0,2) + ":" + (result.trmtThuEnd).substring(2,4)
      })
    }

    if ( (result.trmtFriStart !== undefined) && (result.trmtFriEnd !== undefined)) {
      timeTable.push({
        name: "금요일",
        value: (result.trmtFriStart).substring(0,2) + ":" + (result.trmtFriStart).substring(2,4)
        + " ~ " + (result.trmtFriEnd).substring(0,2) + ":" + (result.trmtFriEnd).substring(2,4)
      })
    }

    if ( (result.trmtSatStart !== undefined) && (result.trmtSatEnd !== undefined)) {
      timeTable.push({
        name: "토요일",
        value: (result.trmtSatStart).substring(0,2) + ":" + (result.trmtSatStart).substring(2,4)
        + " ~ " + (result.trmtSatEnd).substring(0,2) + ":" + (result.trmtSatEnd).substring(2,4)
      })
    }

    if ( (result.trmtSunStart !== undefined) && (result.trmtSunEnd !== undefined)) {
      timeTable.push({
        name: "일요일",
        value: (result.trmtSunStart).substring(0,2) + ":" + (result.trmtSunStart).substring(2,4)
        + " ~ " + (result.trmtSunEnd).substring(0,2) + ":" + (result.trmtSunEnd).substring(2,4)
      })
    }

    if ( result.lunchWeek !== undefined) {
      var lunchTime = "";
      if (result.lunchWeek.indexOf('시') > 0) {
        result.lunchWeek = deleteRegExp(result.lunchWeek)

        lunchTime += result.lunchWeek.substr(0, result.lunchWeek.indexOf('시')) + ':'
        result.lunchWeek = result.lunchWeek.substr(result.lunchWeek.indexOf('시') + 1, result.lunchWeek.length)
        lunchTime += result.lunchWeek.substr(0, result.lunchWeek.indexOf('분')) + ' ~ '
        result.lunchWeek = result.lunchWeek.substr(result.lunchWeek.indexOf('분') + 1, result.lunchWeek.length)
        lunchTime += result.lunchWeek.substr(0, result.lunchWeek.indexOf('시')) + ':'
        result.lunchWeek = result.lunchWeek.substr(result.lunchWeek.indexOf('시') + 1, result.lunchWeek.length)
        lunchTime += result.lunchWeek.substr(0, result.lunchWeek.indexOf('분'))
      } else {
        lunchTime = result.lunchWeek.replace(/ /gi, "").replace('~', ' ~ ')
      }

      timeTable.push({
        name: "점심시간",
        value: lunchTime
      })
    }

  } catch (exception) {
    wayToCome = null
    timeTable = null
  }



  console.log("# Step 3. 진료과목정보")
  url = "http://apis.data.go.kr/B551182/medicInsttDetailInfoService/getMdlrtSbjectInfoList"
    + '?serviceKey=' + config.get('serviceKey')
    + '&pageNo=' + 1 // max 100
    + '&numOfRows=' + 30 // max 100
    + '&ykiho=' + hospital.id
  result = http.getUrl(url, { format: 'xmljs' })

  var service = ""
  try {
    result = result.response.body.items.item
    if (result.length > 0) {
      for (var i = 0; i < result.length; i++) 
        service += ", " + result[i].dgsbjtCdNm
      service = service.substring(2, service.length)
      console.log(service)
    } else 
      service = result.dgsbjtCdNm
  } catch (exception) {
    service = null
  }
  console.log(result)




  console.log("# Step 4. 교통정보")
  url = "http://apis.data.go.kr/B551182/medicInsttDetailInfoService/getTransportInfoList"
    + '?serviceKey=' + config.get('serviceKey')
    + '&pageNo=' + 1 // max 100
    + '&numOfRows=' + 30 // max 100
    + '&ykiho=' + hospital.id
  result = http.getUrl(url, { format: 'xmljs' }).response.body
  console.log(result)

  var transportation = []
  try {
    if (result.totalCount > 0) {
      result = result.items.item
      if (result.length > 0) {
        for (var i = 0; i < result.length; i++) {
          transportation.push({
            icon: result[i].trafNm =='지하철' ? "images/icons/metro.png" : "images/icons/bus.png",
            lineNo: result[i].lineNo,
            station: result[i].arivPlc,
            dir: result[i].dir ? result[i].dir : null
          })
        }
      } else {
        console.log('else in')
        transportation.push({
          icon: result.trafNm == '지하철' ? "images/icons/metro.png" : "images/icons/bus.png",
          lineNo: result.lineNo,
          station: result.arivPlc,
          dir: result.dir ? result.dir : null
        })
      }
    }
  } catch (exception) {
    transportation = null
  }



  result = {
    wayToCome: wayToCome,
    categoryName: categoryName,
    timeTable: timeTable,
    service: service,
    transportation: transportation
  }

  console.log(result)
  return result
}

function deleteRegExp(str) {
  var regExp = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi
  return str.replace(regExp, "")
}

function trim_brace(str) {
  var idx = str.indexOf('(')
  if ( idx != -1) str = str.substr(0,idx)
  return str
}
