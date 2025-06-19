# BI-RedBack

## Project Overview
It is often tedious for assessors to mark verbose solutions to extended response questions. By streamlining the question down to simple statements and connecting the statements in a tree-like structure, it can make marking easier and facilitate students’ learning. BioLogic presents an interactable platform for students to build the answer trees. The team is asked to implement the backend server program into a web application which can talk to the existing server code.

In this project, the team will use **Vue.js 3** to develop the front end of this application. In this web application, student is allowed to answer questions by creating graphical Explanation Networks using statements and logical connectors. The answers will be sent to the server and then marked by BioLogic Marking Assistant. This project will span about 3 months and will be done so in Agile fashion, divided into 4 sprints.


## Project Member
### Client
Michael Murray (murraym@unimelb.edu.au)  
Ping Charoenwet (ping.charoenwet@unimelb.edu.au)  
### Supervisor
Wei Wang (wang.w11@unimelb.edu.au)  
### Project team
Anwen Xu - Product Owner (anwenx1@student.unimelb.edu.au)  
Nan Du - Scrum Master (nadu@student.unimelb.edu.au)  
Zhihong Sui - Developer (suizs@student.unimelb.edu.au)  
Xuemin Liu - Developer (xueminl@student.unimelb.edu.au)  
Yilin Li - Developer (yilin13@student.unimelb.edu.au)  

## Naming Conventions
### Branches
 - task/T-x.x.x-task-description
 - bugfix/T-x.x.x-bug-description
 - hotfix/Release-x-issue-description

### Commits
 - feat: new feature description
 - fix: fixed a bug
 - refactor: existing code refactored
 - style: update styles
 - docs: update documentation

### Pull Requests (PR)
Please refer to the pull requests section for PR details.

## Branches and PRs
When you have decided to work on a new task outlined on [Trello](https://trello.com/b/rC8OQ8TC/bi-redback), please follow these steps:
 - Create a new branch on your local repository, following the naming conventions as outlined above.
 - When ready, push the branch onto this remote repository.
 - Create a new PR in the following format:
     -  Task/Bugfix/Hotfix
     -  x.x.x (indicating which task or release it belongs to)
     -  brief description of the change in the title
     -  The description should provide more details about the change, including any relevant context. E.g., if this is a bugfix, it should indicate how the bug occurred.
 - Request @anwenx1 to review the PR before merging. DO NOT merge your PR without reviewing it first!

## Project Roadmap
 - ~~24th March 2023: End of Sprint 1/Inception~~
 - ~~1st May 2023: End of Sprint 2 (Updated)~~
 - 26th May 2023: End of Sprint 3
 - 9th June 2023: End of Sprint 4 and project.

## Project Setup
 1. Clone this repository.
 2. Run `npm install` on the project directory.
 3. Run `npm run dev` to start the server.
 4. More detailed instructions are available in Confluence > Project Information > Development Documentation > [Setting up](https://confluence.cis.unimelb.edu.au:8443/pages/viewpage.action?pageId=131227783)

## [Trello Board](https://trello.com/b/rC8OQ8TC/bi-redback)
Please keep Trello up-to-date and make sure that it correctly reflects your progress. Please view the [Trello instructions](https://confluence.cis.unimelb.edu.au:8443/x/h2LSBw) prior to editing the board.

## The directory structure:

```
main
├── docs/Requirement Docs　　　　 # Requirements related items
│   ├───Requirement Docs         # DO-BE-FEEL Chart, Motivation Model, Personas and User Stories
│   ├───Planning Docs            # Projection Description with purpose and scope and Sprint Planning
│
├── node_modules    　　　　　　  #  The full set of dependencies for the Vue3 application
|
├───prototypes                   # Design prototypes of the application
│   ├───high fidelity            # image of high fidelity prototype
│   └───low fidelity             # image of low fidelity prototype
|
├───src                          # All Vue3 codes of this project
│   ├───assets                   # JSON file, images and CSS files needed for the project
│   └───components               # Codes of all child components appended on the main App
│       ├───icons
│       └───statements           # Different types of statements stored in one directory
|
├── tests/　　　　　　　　　　　　 # User/system tests
|
├── ui/　　　　　　　　　　　　    # All the images created for the prototypes (icons, fonts, backgrounds)
|
└── data samples/　　　　　　  　 # Documents to generate with all the data (inputs)
```

## Sprint 2 New Release
### Application Demo Video
You can see our current progress via this link: https://youtu.be/VSlP46DsSYg

### Description
This sprint focuses on developing the fundamental features of this project, including displaying an entire question and allow students to construct an answer. At this moment, students can use connectors and statements to construct an answer successfully, albiet taking up a lot of space.

### Upgrade
For this sprint, we have focused on further developing the Redback application and expanding its features. Below is a list of components that have been changed or added in each branch:

Main Branch: Updated Components: 
* AnswerArea (https://github.com/COMP90082-2023-SM1/BI-RedBack/blob/main/src/components/AnswerArea/AnswerArea.vue) 
* AnswerTextGeneratorArea (https://github.com/COMP90082-2023-SM1/BI-RedBack/blob/main/src/components/AnswerTextGeneratorArea.vue) 
* AppDesign (https://github.com/COMP90082-2023-SM1/BI-RedBack/blob/main/src/components/AppDesign.vue) 
* Connector (https://github.com/COMP90082-2023-SM1/BI-RedBack/blob/main/src/components/Connector.vue) 
* ConnectorArea (https://github.com/COMP90082-2023-SM1/BI-RedBack/blob/main/src/components/ConnectorArea.vue)
* QuestionArea (https://github.com/COMP90082-2023-SM1/BI-RedBack/blob/main/src/components/QuestionArea.vue)
* RenderStatement (https://github.com/COMP90082-2023-SM1/BI-RedBack/blob/main/src/components/RenderStatement.vue)
* StatementArea (https://github.com/COMP90082-2023-SM1/BI-RedBack/blob/main/src/components/StatementArea.vue)
* StatementFreeText (https://github.com/COMP90082-2023-SM1/BI-RedBack/blob/main/src/components/StatementFreeText.vue)
* StatementRoot (https://github.com/COMP90082-2023-SM1/BI-RedBack/blob/main/src/components/StatementRoot.vue)
* StatementStudent (https://github.com/COMP90082-2023-SM1/BI-RedBack/blob/main/src/components/StatementStudent.vue)
* StatementTruth (https://github.com/COMP90082-2023-SM1/BI-RedBack/blob/main/src/components/StatementTruth.vue)


### New Features
The following describe recent updates made to various components of a software application:

* The Connector component has been added to allow users to visually render the connections between questions and answers. It features a graphical representation of the logical connection between questions and answers, as well as a drag-and-drop feature that enables users to adjust the connections.
* The AnswerArea component has been updated to enable users to drag and drop multiple connectors into the answer area. The design has also been enhanced to allow for clearer visualization of the connections between questions and answers.
* The ConnectorArea component has been updated to include the same features as the AnswerArea component, allowing users to drag and drop multiple connectors and view the connections more clearly.
* The Connector component has also been updated to include the same drag-and-drop and improved design features as the other components.
* The AnswerTextGeneratorArea component has been added to allow users to generate answer text for their statements. It includes a text box, a drop-down menu, and buttons for generating the answer text.
* The RenderStatement component has been added to transfer data from all other 4 types of statements. It also includes a drag-and-drop feature that allows users to drag statements to the answer area.
* The StatementArea component has been added to visualize all statement components on the web page. It features a new design that allows users to select answers within statements, as well as the ability to drag statements into the answer area or connect them with connectors.

### Bug Fixes
N/A as this is the first working release of the product.

## Changelogs 
### Sprint 1 (28/03)
1. Structure all the folders
2. Upload requirement documents and planning documents to docs/ folder
3. Upload images of high fidelity prototype and low fidelity prototype to prototype/ folder 

### Sprint 2 (30/04)
1. Add some dependency modules which are necessary for the development environment.
2. Complete some functions of the App and upload the source codes and keep fixing bugs.
3. 17/04/23: Merge branch "base" to "main" - Complete T1.1.1 and T1.1.2. The connectors can be displayed.
4. 18/04/23: Merge branch "read_json_n_display_statement" to "main" - Complete T1.2.1, T1.2.2 and T2.2.1. Add the function of reading from JSON file and displaying question prompt and statements according to the file.
5. 19/04/23: Merge branch "ZhihongSui" to "main" - Complete T3.3.1. Update the design of the App. Fix the problem of T1.2.2 to make TRUTH Statement successfully displaying images. Modify the style of all statement.
6. 21/04/23: Merge branch "ZhihongSui" to "main" - Rearrange the design of the main page to allow other members to add their functions.
7. 23/04/23: Merge branch "dragToWorkspace" to "main" - Complete T1.3.1: 1 single connector can be dragged to the Answer and its both sides can be filled with statements.
8. 25/04/23: Merge branch "zhihongSui_1229418" to "main" - Add tooltips for each area and refine the statement style.
9. 25/04/23: Merge branch "XueminLiu" to "main" - Complete T1.4.1 and T1.4.3. Add the function of transforming contents in Answer Area to the form of text in Answer Generator Area. The text can change along with the contents changing in Answer Area.
10. 26/04/23: Merge branch "zhihong" to "main" - Fix the bug in tooltips. Fix the bug in T1.4.1, refining the text of TRUTH statement when transforming into texts.

## Acknowledgements
Part of this document was drafted by [ChatGPT](https://openai.com/blog/chatgpt) and we want to make sure to acknowledge its contribution.
