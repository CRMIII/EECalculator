"use client";
import { forwardRef, useEffect, useRef, useState } from "react";
import { Spreadsheet, Worksheet, jspreadsheet } from "@jspreadsheet/react";
import Modal from "./Modal";
import buildingTypes from "@/app/lib/buildingtypes";
import "node_modules/jsuites";
import fixtureCodes from "@/app/lib/csvjson";
import hvac from "@/app/lib/hvac";
import eaf from "@/app/lib/eafpaf";
import { PlusCircle, Search } from "react-feather";

const license =
  "NTZjYWVhMDVmZWFjZGYzNzIzOTRlMDIxMTZlZGJkNzBmZjk1MzI5OGI5MDU1MDlhNjdhNmE0YjkxMzhiMjA5NjlhMjhkYjUyNDgwY2E0OTVmZjUzY2MwYTI0MGQ1Yzc3MDQzYWU2MjU2NGNkOTg0ODI2MjY2OGVmOWZiZTYxMWMsZXlKdVlXMWxJam9pWTJoaGNteGxjeUlzSW1SaGRHVWlPakUzTURNNE9UUTBNREFzSW1SdmJXRnBiaUk2V3lKM1pXSWlMQ0pzYjJOaGJHaHZjM1FpWFN3aWNHeGhiaUk2TUN3aWMyTnZjR1VpT2xzaWRqY2lMQ0oyT0NJc0luWTVJaXdpZGpFd0lsMTk=";

const Table = forwardRef((props, ref) => {
  const siteNames = [];
  const areaNames = [];
  var siteId = 1;
  var siteInfo = [];

  const filterOptions = (o, cell, x, y, value, config) => {
    var value = o.getValueFromCoords(x - 4, y);
    const areaFilter = config.source.filter((area) => { 
      if(area.siteId == value){
        return true
      }
       })
      config.source = areaFilter
     return config
    }
    const addRow = () => {
      if(ref.current[0]){
        ref.current[0].insertRow()
      }
      if(ref.current[1]){
        ref.current[1].insertRow()
      }
    }
    
  //Save Worksheets to State
  const saveSites = () => {
    if (ref.current[0].getWorksheetActive() === 0) {
      const data = ref.current[0].getData();
      const dataMap = data.map((d) => {
        const arr = [];
        const name = d[0]
        const area = d[1]
        const bt = buildingTypes.find(({id}) => id === Number(d[2])).value
        const he = hvac.find(({id}) => id === Number(d[3])).value
        const eafpre = eaf.find(({id}) => id === Number(d[3])).value
        const eafpost = eaf.find(({id}) => id === Number(d[3])).value
        arr.push(name, area, bt, he, eafpre, eafpost)
        return arr
       }
       )
       siteInfo = dataMap
      console.log(dataMap)
      var id = 0
      dataMap.forEach(function (d) {
        const dm = d.filter((n) => n);
        if(dm.length === 6) {
         
        if(areaNames.find(({name}) => name === dm[1])){
          if(!siteNames.find(({name}) => name === dm[0])){
          siteId +=1
          id += 1
          areaNames.push({id: id, siteId: siteId, name: dm[1], value: dm[2]})
          }
          else {
            id += 1
            areaNames.push({id: id, siteId: siteId, name: dm[1], value: dm[2]})
          }
        }

        if(!areaNames.find(({name}) => name === dm[1])){
          id += 1
          areaNames.push({id: id, siteId: siteId, name: dm[1], value: dm[2]})
         
      }  

        if(!siteNames.find(({ name }) => name === dm[0])) {
          siteNames.push({ name: dm[0], id: siteId });
        }
        if(siteNames.find(({name}) => name === dm[0])){
          if(!areaNames.find(({name}) => name === dm[1])){
            siteId +=1
            siteNames.push({ name: dm[0], id: siteId })
          }
        }
      }
        
      });
      ref.current[1].deleteColumn(0)
      ref.current[1].insertColumn([
        {
          column: 0,
          options: {
            type: "dropdown",
            title: "Site Names",
            source: siteNames,
          },
        },
      ]);
      ref.current[1].deleteColumn(4)
      ref.current[1].insertColumn([
        {
          column: 4,
          options: {
            type: "dropdown",
            title: "Area Types",
            source: areaNames,
            filterOptions: filterOptions,
            multiple: false
          },
        },
      ]);
      ref.current[1].openWorksheet();

    }

  };
  const saveFixtures = () => {
    if(ref.current[0].getWorksheetActive() === 1){
      const data = ref.current[1].getData()
      
      const dm = data.filter(n => n)
      const kwhCol = [];
      const kwCol = [];
      const metroCol = [];
      const nonmetroCol = [];
      const ppkwh = 0.05705655
      const ppkw = 209.21
      if(dm.length <= 10){
         dm.forEach((d) => {
          console.log(d)
          const preWattage = fixtureCodes.find(fixture => fixture['Fixture Code'] === d[5])['Wattage']
          const postWattage = fixtureCodes.find(fixture => fixture['Fixture Code'] === d[8])['Wattage']
          const preq = d[6]
          const postq = d[9]
          const siteInformation = siteInfo[Number(d[4]) -1]
          const hours = siteInformation[2][0]
          const energyHvac = siteInformation[3][0]
          const demandHvac = siteInformation[3][1]
          const preeaf = siteInformation[4]
          const demand = siteInformation[2][1]
          const preKw = ((((preWattage / 1000) * preq) * hours) * preeaf).toFixed(2)
          const postKw = ((postWattage / 1000) * postq) * hours
          const kwhSavings = ((preKw - postKw) * energyHvac).toFixed(1)
          const kwSavings = ((((preWattage/1000) * preq)* demand * preeaf) - (((postWattage/1000) * postq) * demand)) * demandHvac
          const incentiveMetro = ((kwhSavings * ppkwh) + (kwSavings * ppkw)).toFixed(2)
          const incentiveNonMetro = (incentiveMetro * 1.15).toFixed(2)

          kwhCol.push(kwhSavings)
          kwCol.push(kwSavings)
          metroCol.push(incentiveMetro)
          nonmetroCol.push(incentiveNonMetro)

          
        })
      }
       ref.current[1].setColumnData(10, kwCol, true)
       ref.current[1].setColumnData(11, kwhCol, true)
       ref.current[1].setColumnData(12, metroCol, true)
       ref.current[1].setColumnData(13, nonmetroCol, true)
    }
  }
  // Spreadsheet array of worksheets

  // Data
  const worksheet1 = {
    columns: [
      { type: "text", title: "Site Name", width: 150 },
      {
        type: "text",
        title: "Area Type",
        width: 150,
        editable: true
      },
      {
        type: "dropdown",
        title: "Building Type",
        width: 250,
        source: buildingTypes,
      },
      { type: "dropdown", title: "Air Conditioning", source: hvac, width: 120 },
      { type: "dropdown", title: "Pre-Controls", source: eaf,width: 80 },
      { type: "dropdown", title: "Post Controls", source: eaf, width: 100 },
    ],
    data: [
      [
        "Jims Burgers",
        "Hallway",
        "Agrictulture",
        "Yes",
        "None",
        "Occupancy Sensors",
      ],
      [
        "Jims Burgers",
        "Office",
        "Agrictulture",
        "Yes",
        "None",
        "Occupancy Sensors",
      ],
      [
        'Johns Burgers',
        'Hallway',
        'Agriculture',
        'yes',
        'None',
        'Occupancy Sensors'
      ],
      [
        'Johns Burgers',
        'Office',
        'Agriculture',
        'yes',
        'None',
        'Occupancy Sensors'
      ]
    ],
    minDimensions: [6, 3],
  };

  const worksheet2 = {
    columns: [
      { type: "text", title: "Site Name", width: 150, autoIncrement: false },
      { type: "number", title: "Site Line Item Order", width: 50 },
      { type: "text", title: "Location/Room Description", width: 250 },
      { type: "number", title: "Map Id", width: 100 },
      { type: "text", title: "Area Type", width: 80 },
      { type: "text", title: "Pre-Fixture Code", width: 100 },
      { type: "number", title: "No. Of Pre-Fixtures", width: 100 },
      { type: "number", title: "Non-Operating Fixtures", width: 100 },
      { type: "text", title: "Post-Fixture Code", width: 100 },
      { type: "number", title: "No. Of Post-Fixtures", width: 100 },
      { type: "number", title: "KW Savings", width: 100, readonly: true},
      { type: "number", title: "KwH Savings", width: 100, readonly: true},
      { type: "number", title: "Incentive(Metro)", width: 100, readonly: true, options: {style: 'currency', currency: 'USD'}},
      { type: "number", title: "Incentive(Non-Metro)", width: 100, readonly: true, options: {style: 'currency', currency: 'USD'}}

    ],
    data: [['', 1, 'e hallway', 1, '', 'MH250/1', 10, 2, 'LED100-FIXT', 10],
           ['', 2, 'w hallway', 1, '', 'MH250/1', 10, 2, 'LED100-FIXT', 10],
           ['', 3, 's hallway', 1, '', 'MH250/1', 10, 2, 'LED100-FIXT', 10]],
    minDimensions: [10, 3],
  };

  return (
    <div>
      <div>
      <button onClick={addRow} alt='Add Row'>
      <PlusCircle size={32}></PlusCircle>
      </button>
     
      </div>

      <Spreadsheet ref={ref} license={license}>
        <Worksheet
          data={worksheet1.data}
          columns={worksheet1.columns}
          minDimensions={worksheet1.minDimensions}
        />
        <Worksheet
          data={worksheet2.data}
          columns={worksheet2.columns}
          minDimensions={worksheet2.minDimensions}
        >
          
        </Worksheet>
      </Spreadsheet>
     
      <input type="button" value="Add Sites" onClick={saveSites} />
      <input type="button" value="Add Fixtures" onClick={saveFixtures} />
    </div>
  );
});

export default Table;
