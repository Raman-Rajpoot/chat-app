import React, { useState } from 'react'

function Visulization_chart() {
  const [data_file, change_file] = useState(null)
  return (
    <div>
        <input type="file" name="data_file" id="data_file" onChange={(e)=>{
          change_file(e.target.value);
        }}/>
    </div>
  )
}

export default Visulization_chart