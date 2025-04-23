# Little Shop Front End

### Abstract:

Little shop is an admin portal that has an interface for an ecommerce platorm for our merchants. They can add and edit items and gives them a realtime visualization of the database. It comes with a search functionality and sort functions to help organize the view. Our app is solving the problem of letting the merchants manage their items from this portal in an easy user friendly way.

### Installation Instructions:

1. Clone the repository:
`git clone https://github.com/JustJoeYo/little-shop-fe.git
cd little-shop-fe`

2. Install dependencies:
`npm install`

3. Start the development server:
`npm run dev`

4. Ensure the backend API is running at the expected endpoint

5. Access the application at http://localhost:5173

### Preview of App:

<img src="https://avatars.githubusercontent.com/u/61035563?v=4" alt="contrib.rocks image" width="128" height="128" />

### Context:

We worked on this project over a span of 10 days, during which we introduced a redesigned frontend that significantly improved upon the original. The updated design added new features like a search bar and sorting options, and included refreshed styling to enhance readability and create a cleaner, more user-friendly interface.

### Contributors:

<a href="https://github.com/cateprofir13">
  <img src="https://avatars.githubusercontent.com/u/61035563?v=4" alt="contrib.rocks image" width="128" height="128" />
</a>
<a href="https://github.com/cdsuit00">
  <img src="https://avatars.githubusercontent.com/u/197514624?v=4" alt="contrib.rocks image" width="128" height="128" />
</a>
<a href="https://github.com/bblair321">
  <img src="https://avatars.githubusercontent.com/u/81390380?v=4" alt="contrib.rocks image" width="128" height="128" />
</a>
<a href="https://github.com/JustJoeYo">
  <img src="https://avatars.githubusercontent.com/u/53631725?v=4" alt="contrib.rocks image" width="128" height="128" />
</a>

Cate's [![Cate's LinkedIn][linkedin-shield]][linkedin-url3]
Calvin's [![Calvin's LinkedIn][linkedin-shield]][linkedin-url2]
Brady's [![Brady's LinkedIn][linkedin-shield]][linkedin-url4]
Joe's [![Joe's LinkedIn][linkedin-shield]][linkedin-url]

### Learning Goals:

- Use ActiveRecord and SQL to write queries that deal with one-to-many database relationships  
- Expose API endpoints to CRUD database resources  
- Validate models and handle sad paths for invalid data input  
- Test both happy and sad path functionality based on JSON contracts  
- Use MVC to organize code effectively, limiting data logic in controllers and serializers  
- Track user stories with GitHub Projects  
- Improve an existing frontend application by:
  - Styling the user interface  
  - Refactoring JavaScript code  
  - Adding an additional frontend feature  

### Wins + Challenges:

Wins: Getting the backend working with our postman tests and succesfully getting the backend and frontend working together.
A challenge we ran into was loading the data on the item and merchants cards. When making api calls it would take a little bit to populate the data. We overcame this by making a local database for the frontend.

[contributors-shield]: https://img.shields.io/github/contributors/JustJoeYo/futbol.svg?style=for-the-badge
[contributors-url]: https://github.com/JustJoeYo/futbol/graphs/contributors
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/joseph-samere-981a5b291/
[linkedin-url2]: https://linkedin.com/in/calvinsuiter/
[linkedin-url3]: https://linkedin.com/in/cate-profir/
[linkedin-url4]: https://linkedin.com/in/bradyjblair/
