import React from 'react'
import { useState } from 'react'

const PredictionForm = ({onPredict}) => {
 const [formData, setformData] = useState({
    time: "",
    weather:"",
    vehicles:""
 })
  return (
    <div className='predict-form-body'>
      PREDICTION FORM COMPONENT
      <input type="text" name="time" id="" placeholder='Enter Time of the Day' value={formData.time} onChange={(e)=>setformData({
        ...formData,
        [e.target.name] : e.target.value
      })} />
      <input type="text" name="weather" id="" placeholder='Enter Weather' value={formData.weather} onChange={(e)=>setformData({
        ...formData,
        [e.target.name] : e.target.value
      })} />
      <input type="text" name="vehicles" id="" placeholder='Enter No of Vehicles' value={formData.vehicles} onChange={(e)=>setformData({
        ...formData,
        [e.target.name] : e.target.value
      })} />
      <button onClick={()=>{onPredict(formData)}} >CLICk</button>
      {console.log(formData)}
    </div>
  )
}

export default PredictionForm
