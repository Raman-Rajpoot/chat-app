const emitEvent = (req, event, users ,data) =>{
   console.log("emitting event..", event)
}

const deleteFileFromCloudinary = (public_id) => {
  console.log("deleting file from cloudinary..", public_id)
}

export default { emitEvent, deleteFileFromCloudinary };