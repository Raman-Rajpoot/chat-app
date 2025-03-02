import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    content: {
      type: String,
    //   required: true,
    },
    // Optionally, store message types (text, image, etc.) or attachments:
    // messageType: {
    //   type: String,
    //   default: "text",
    // },
    attachments: [
       {
         public_id: {
            type: String,
            default: "",
          },
          url : {
            type: String,
            default: "",
          }
        }
    ], 
  },
  { timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);
