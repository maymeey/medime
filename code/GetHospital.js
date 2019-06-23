var http = require('http')
var config = require('config')
var console = require('console')

module.exports.function = function getHospital (myLocation, region, service) {

  if (region !== undefined) {
    var local = [null, null, null]

    // 지역명칭 정리
    if (region.levelOne) {
      local[0] = region.levelOne.name
      if (region.locality) {
        local[1] = region.locality.name
        if (region.subLocalityOne) {
          local[1] = local[1].substring(0, local[1].length - 1) + region.subLocalityOne.name
          if (region.subLocalityTwo)
            local[2] = region.subLocalityTwo.name
        } else {
          if (region.subLocalityTwo)
            local[2] = region.subLocalityTwo.name
        }
      }
    } else {
      local[0] = region.locality.name
      if (region.subLocalityOne) {
        local[1] = region.subLocalityOne.name
        if (region.subLocalityTwo) 
          local[2] = region.subLocalityTwo.name
      }
    }

    console.log(local)

    var sidoCode = searchSidoCode(local[0])
    console.log('sidoCode: ' + sidoCode)
    var sgguCode = searchSigunguCode(local[1], sidoCode)
    console.log('sgguCode: ' + sgguCode)
    var dongName = local[2]

    url = config.get('hospInfoService')
      + '?serviceKey=' + config.get('serviceKey')
      + '&pageNo=' + 1 // max 100
      + '&numOfRows=' + 30 // max 100
      + '&sidoCd=' + sidoCode
      + '&sgguCd=' + sgguCode
      + '&emdongNm=' + encodeURI(dongName)

    if (service !== undefined)
      url += '&dgsbjtCd=' + service


    console.log(url)

  } else {
    url = config.get('hospInfoService')
      + '?serviceKey=' + config.get('serviceKey')
      + '&pageNo=' + 1 // max 100
      + '&numOfRows=' + 30 // max 100
      + '&radius=' + 4000 // unit: meter
      + '&xPos=' + myLocation.longitude
      + '&yPos=' + myLocation.latitude
    // + '&yadmNm=' + encodeURI("서울대학교병원")

    if (service !== undefined)
      url += '&dgsbjtCd=' + service
  }

  var result = http.getUrl(url, { format: 'xmljs' }).response.body
  console.log(result)

  if (result.totalCount > 0) {
    result = result.items.item

    if (result.length > 1) {
      var arr = []
      for(var i = 0; i < result.length; i++) {
        var hospital = {
          id: result[i].ykiho,
          name: result[i].yadmNm,
          address: result[i].addr,
          tel: result[i].telno,
          marker: {
            longitude:result[i].XPos,
            latitude: result[i].YPos
          },
          categoryLevelOne: result[i].clCd,
          doctorCnt: result[i].drTotCnt
        }

        if (result.distance !== undefined)
          hospital.distance = (result.distance / 1000).toFixed(2)
        else if (myLocation !== undefined)
          hospital.distance = getDistanceFromLatLonInKm(myLocation.latitude, myLocation.longitude, result[i].YPos, result[i].XPos)

        arr.push(hospital)
      }
      if (myLocation !== undefined)
        arr = arr.sort(function(a,b) { return a.distance - b.distance })
      return arr

    } else {
      var hospital = {
        id: result.ykiho,
        name: result.yadmNm,
        address: result.addr,
        tel: result.telno ? result.telno : "-",
        marker: {
          longitude:result.XPos,
          latitude: result.YPos
        },
        categoryLevelOne: result.clCd,
        doctorCnt: result.drTotCnt
      }

      if (result.distance !== undefined)
        hospital.distance = (result.distance / 1000).toFixed(2)
      else if (myLocation !== undefined)
        hospital.distance = getDistanceFromLatLonInKm(myLocation.latitude, myLocation.longitude, result.YPos, result.XPos)

      return hospital
    }
  } else 
    return null
}

function searchSidoCode (region) {

  if (region == '서울특별시') return '110000'
  else if (region == '부산광역시') return '210000'
  else if (region == '부산광역시') return '210000'
  else if (region == '인천광역시') return '220000'
  else if (region == '광주광역시') return '240000'
  else if (region == '대전광역시') return '250000'
  else if (region == '울산광역시') return '260000'
  else if (region == '경기도') return '310000'
  else if (region == '강원도') return '320000'
  else if (region == '충청북도') return '330000'
  else if (region == '충청남도') return '340000'
  else if (region == '전라북도') return '350000'
  else if (region == '전라남도') return '360000'
  else if (region == '경상북도') return '370000'
  else if (region == '경상남도') return '380000'
  else if (region == '제주특별자치도') return '390000'
  else if (region == '세종특별자치시') return '410000'
  else return -1;

}

function searchSigunguCode (localName, sidoCode) {
  var url = config.get('getAddrCodeList')
  + '?serviceKey=' + config.get('serviceKey')
  + '&pageNo=' + 1 // max 100
  + '&numOfRows=' + 100 // max 100
  + '&addrTp=' + 2
  + '&sidoCd=' + sidoCode

  var result = http.getUrl(url, { format: 'xmljs' }).response.body.items.item

  for (var i = 0; i < result.length; i++) 
    if (result[i].addrCdNm == localName) return result[i].addrCd
  return null
}


function getDistanceFromLatLonInKm(lat1,lng1,lat2,lng2) {
  function deg2rad(deg) {
    return deg * (Math.PI/180)
  }

  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lng2-lng1);
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in km
  return d.toFixed(2);
}
