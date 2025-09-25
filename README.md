**Icebox**

The one-stop transformer app for grocery and meal prep needs. Is the culmination of "Waste not, want not".

This was an MVP project that was coded throughout 24 non-consecutive hours. This full stack application is a fridge inventory, grocery list, and recipe tin. My end goal with this project is to have it be a mobile app that can be live on a tablet, turning any fridge into a smart fridge. 

**Tech Stack**

* React
* Express.js
* Node.js
* SQL (PostgreSQL/PG Node)
* Axios
* Bcrypt

**Getting Started**

Install all dependencies in the root folder and in the client directory. Make a copy of `sample.env` and fill it out.

Run the app by building the client with `npm run build` in the client folder, and start the sever with `npm run start` in the root directory.

The application will be hosted on `localhost:3000`. 

**Using the App**

Once a user is logged in, they may add new fridge items, including name, category, quantity, and unit. They can also add items to their grocery list using those same fields. The category will be a generic description of the specific fridge item, for example "mozzarella" could have a category of "cheese". The reason for this is because the other core feature, meal planner, can suggest meals based on categories rather than strict ingredient names.

**Features**

A key feature of the fridge items list is the ability to quickly increment, decrement, remove, and add things to the grocery list without having to fill out a traditional form. When an item is used up from the fridge, a prompt will be toggled to add that item and its original ingredient count (the count right before it was used up) to the grocery list. Conversely, when an item is checked off the grocery list, a prompt will add that item back to the fridge. Behind the scenes, these ingredients have a central ingredient schema that allows pseudo-deletion and re-creation of fridge and grocery items.

The meal planner currently allows users to create meals that are shared with other users. The ingredients specified in these meals have a name and also a category, to allow users to make meals with similar ingredients. I believe this is a critical difference between my app and any other recipe suggestion API. Even though I don't have spaghetti pasta, marinara, and ground beef, I could possibly a similar meal following the same recipe if I had rigatoni pasta, bolognese sauce, and ground sausage. 

**Development Process**

The app is not complex by nature, and can be boiled down to three lists. The hardest part for me was figuring out how to DRY out the code but still have an intuitive UI. For example, I wanted functionality to add an item to the grocery list with prefilled fields from the fridge page, and also be able to add an item from scratch on the grocery list page. I wanted similar abilities for adding a fridge item from the grocery list and from the fridge page. All adding capabilities should create new items in the database and update states, but stay on the current page. To do this, I had to configure various handlers and conditionals to update and reset states, which was very confusing to debug/test. I learned more about using nested handlers and delegating more variables to keep track of whether modals were displayed or not and how to reuse components with different sets of properties defined and undefined to adapt to a variety of use cases.

In future enhancements, I should expand upon the meal planner feature and make a better UX for it. For an MVP, I had all users add to the same database of meals, but that means recipe ideas are only as robust as the user set. I could scrape and import recipes from popular food sites first, and develop a system for categorizing them automatically, potentially using AI tools. There should also be a "My Recipes" or "My Meals" filter for use cases when users want their tried-and-true comfort meals. I could also add additional columns to the fridge items list, especially an expiration date field that I had in mind when I added in created and updated columns to the database. It would be nice to get alerts or be able to sort by expiring items and maybe have those items take higher priority when sorting for suggested meals in the meal planner. I don't think implementing that would be horribly resource intensive, but would involve more complex sort criteria.
