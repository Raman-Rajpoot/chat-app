
import { User } from "../models/user.model.js"; // Adjust the path as needed
import { faker } from "@faker-js/faker";
import { v4 as uuidv4 } from "uuid";

const seedUsers = async (numberOfUsers = 3) => {
  try {
    
    const createdUsers = [];

    for (let i = 0; i < numberOfUsers; i++) {
      const name = faker.person.fullName();
      const email = faker.internet.email();
      const bio = faker.lorem.sentence(10);
      // Constant password for testing; in production, ensure passwords are securely handled
      const password = "Password123!";
    //   const avatar = {
    //     public_id: uuidv4(),
    //     url: faker.image.avatar(),
    //   };

      createdUsers.push({
        name,
        email,
        bio,
        password,
        // avatar,
      });
    }

    const insertedUsers = await User.insertMany(createdUsers);
    console.log("Users seeded successfully:", insertedUsers);


  } catch (error) {
    console.error("Error seeding users:", error);
    process.exit(1);
  }
};


export default seedUsers;
 