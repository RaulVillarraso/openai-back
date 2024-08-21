const OpenAI = require('openai')

const openai = new OpenAI({apiKey: process.env.API_KEY})

async function getSynonyms(req, res) {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Please, can you create a json with the english synonyms for the word ${req.body.text}? The json must have a field called 'synonyms', whose value is an array with each synonym. Thanks!`
        },
      ],
      model: "gpt-3.5-turbo-1106",
      response_format: { type: "json_object" },
    });
  
    return res.json(completion.choices[0]);
  } catch (error) {
    return res.send(error)
  }
}

// async function generateTasks (req, res) {
//   try {
//     const completion = await openai.chat.completion.create({
//       messages: [
//         {
//           role: "system",
//           content: `I want you to generate different tasks to develop a project following the next description: ${req.body.text}
          
//           1. These tasks should be able to be done in less than two days.
//           2. These tasks should be for back-end and front-end
//           3. These tasks should have a priority number from one to three being three the top priority.
          
//           Let's think step by step:
//           3.1 Generate a task following the description
//           3.2 Generate a priority number. If this task blocks another task generated, assign top priority.
//           3.3 Keep in mind if the task can be made in less than an hour should have the less priority posible.
          
//           The response must be in json format. 
//           {
//             "title": String,
//             "priority": Number
//           }`
//         }
//       ],
//       model: "gpt-3.5-turbo-1106",
//       response_format: { type: "json_object" },
//     })
//     return res.json(completion.choices[0]);
//   } catch (error) {
//     return res.send(error)
//   }
// }

async function generateTasks(req, res) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          rules:`
          1. Tasks are meant to be made in less than two days.
          2. Do not make tasks that are full features.
          `,
          content: `I want you to generate different tasks to develop a project following the next description: ${req.body.text}
          
          1. If the task generated is a full feature, divide it in smaller tasks, i.e: "Users should be able to Login" could be divide
          in different tasks like "Make Login in API", "Create a Login Form".
          2. These tasks should have all the properties especified on the response format
          3. The weight of the tasks should be a relation between time cost and relevance
          4. The Checklist field is an array of objects containing name and done. This field is optional
          5. Maybe on the generated tasks should be designer/UX-UI subtasks. Separate tasks following who are gonna make the task, developers or designers. 
          
          Let's think step by step:
          2.1 Generate response following the description
          2.2 Generate a priority field. If this task blocks another task generated, assign high priority.
          2.3 Analyze if the task is relevant to finish the feature.
          2.4 Calculate the completation time for the task
          2.5 Generate a number(1,2,4,8) that represent the time in hours
          2.6 If the task weight is lower than 2 the checklist should be empty
          2.7 Analyze if the task needs a subtask or a list of subtask to be done.
          2.8 Generate an array of objects where the property name are the subtasks needed to complete the task in the checklist field.

          # RESPONSE #
          - The response must be in json format

          - title: String
          - priority: Enum(low, medium, high)
          - description : String
          - type: enum(feature, chore, bug)
          - weight: enum(1,2,4,8)
          - status: String
          - checklist: Array of objects (Optional)
          - checklist.name: String
          - checklist.done: Boolean

          {
            "title": String,
            "priority": enum(low, medium, high),
            "description": String,
            "type": enum(feature, chore, bug),
            "weight": enum(1,2,4,8),
            "status": "Backlog",
            "checklist":[
            {
              "name": String,
              "done": False
            }]
          }
          `,
          // response_format: `
          // - title: String
          // - priority: Enum(low, medium, high)
          // - description : String
          // - type: enum(feature, chore, bug)
          // - weight: enum(1,2,4,8)
          // - status: String
          // - checklist: Array of objects (Optional)
          // - checklist.name: String
          // - checklist.done: Boolean

          // {
          //   "title": String,
          //   "priority": enum(low, medium, high),
          //   "description": String,
          //   "type": enum(feature, chore, bug),
          //   "weight": enum(1,2,4,8),
          //   "status": "Backlog",
          //   "checklist":[
          //   {
          //     "name": String,
          //     "done": False
          //   }]
          // }
          // `
        }
      ],
      // response_format is not a valid parameter for the OpenAI API
    });
    // Ensure response is in expected format
    if (completion.choices && completion.choices.length > 0) {
      return res.json(completion.choices[0].message);
    } else {
      return res.status(500).json({ error: 'No valid response from OpenAI API' });
    }
  } catch (error) {
    // Return a more detailed error response
    console.error('Error generating tasks:', error);
    return res.status(500).json({ error: error.message });
  }
}

async function separateByRoles(req, res){
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `I want you to classify tasks between two sections: Back-end and Front-end in this description: ${JSON.stringify(req.body.text)}
          Remember that all the tasks referring to an API or server should be classified in Back-end and all the tasks referring to Client side
          should be classified in Front-end.

          Let's think step by step:
          1. When reading a task identify if the task is referring to an API or server
          2. If last instruction is affirmative classify it in Back-end
          3. If first instruction is negative classify it in Front-end

          The response should be in JSON format:
          {
            FrontEnd: [{task: String}],
            BackEnd: [{task: String}]
          }
          `
        }
      ],
      // response_format is not a valid parameter for the OpenAI API
    });
    // Ensure response is in expected format
    if (completion.choices && completion.choices.length > 0) {
      return res.json(completion.choices[0].message);
    } else {
      return res.status(500).json({ error: 'No valid response from OpenAI API' });
    }
  } catch (error) {
    console.error('Error separating by roles: ', error)
    return res.status(500).json({ error: error.message })
  }
}

async function createDrawing (req, res) {
  try {
    //DALL-E-2 TE PERMITE CREAR VARIAS IMÁGENES EN UNA MISMA PETICIÓN, PERO SON UNA MIERDA
    // const response = await openai.images.generate({
    //   model: "dall-e-2",
    //   prompt: `I'm going to pass you 3 lines of a child's story in an object. I would like you to please draw a child's picture for each line: 
    //    Line 1: ${req.body.line1}
    //    Line 2: ${req.body.line2}
    //    Line 3: ${req.body.line3}
       
    //   Thanks!`,
    //   size: "1024x1024", //default
    //   n: 3
    // });

    // AUNQUE DALL-E-3 SOLO TE PERMITE UNA IMAGEN POR PETICIÓN, QUEDAN MUCHO MEJOR A PARTIR DE LO QUE UN NIÑO PUEDE ESCRIBIR
    const response = await Promise.all(req.body.lines.map(async line => {
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: `Please, draw a picture for a child's story of the following description: ${line}`,
      })
      return response.data
    }))
    return res.json(response)
  } catch (error) {
    return res.send(error);
  }
}

const orders = [
  {
    userId: "1",
    orderId: "abc",
    status: "Delivered",
  },
  {
    userId: "1",
    orderId: "cde",
    status: "Shipped",
  },
  {
    userId: "2",
    orderId: "xyz",
    status: "Delivered",
  },
  {
    userId: "3",
    orderId: "mno",
    status: "In Progress",
  },
  {
    userId: "2",
    orderId: "qwe",
    status: "Delivered",
  },
];

function checkStatus({orderId}) {
  const order = orders.find(order => order.orderId === orderId)
  if (!order) return `No order found for id ${orderId}`

  return `Order status: ${order.status}`;
}

function findUserOrders({userId}) {
  const userOrders = orders.filter(order => order.userId === userId)
  
  if(!userOrders.length) return `You have no orders`

  return userOrders
    .map(order => `Order: ${order.orderId} - Status: ${order.status}`)
    .join('\n') // Convertir a String para poder añadirlo a la conversación
}

async function functionCalling (req, res) {
  try {
    const messages = [
      {
        role: 'user',
        content: req.body.query
      }
    ]

    const tools = [
      {
        type: "function",
        function: {
          name: "check_status",
          description: "Check the status of a specific order",
          parameters: {
            type: "object",
            properties: {
              orderId: {
                type: "string",
                description: "Order identification to search for",
              },
            },
            required: ["orderId"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "check_user_orders",
          description: "Check if the user has any orders",
          parameters: {
            type: "object",
            properties: {
              userId: {
                type: "string",
                description: "User identification to search for",
              },
            },
            required: ["userId"],
          },
        },
      },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: messages,
      tools: tools,
      tool_choice: "auto" //Default value
    });
    
    const responseMessage = response.choices[0].message;

    const toolCalls = responseMessage.tool_calls;
    if (responseMessage.tool_calls) {
      // Step 3: call the function
      const availableFunctions = {
        check_status: checkStatus,
        check_user_orders: findUserOrders

      };

      // Añadir respuesta a la conversación
      messages.push(responseMessage)
      
      for (const toolCall of toolCalls) {
        const functionName = toolCall.function.name
        const functionToCall = availableFunctions[functionName]
        const functionArgs = JSON.parse(toolCall.function.arguments)
        const functionResponse = functionToCall(
          functionArgs //Objeto con los argumentos de para la función
        )

        messages.push({
          tool_call_id: toolCall.id,
          role: "tool",
          name: functionName,
          content: functionResponse,
        }); // Añadir respuesta de la función a la conversación
      }
  
      const secondResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-1106",
        messages: messages,
      }); // Generar nueva respuesta con la cadena de mensajes creada
      return res.json(secondResponse.choices);
    } else {
      return res.json(response.choices);
    }
  } catch (error) {
    return res.send(error)
  }
}

module.exports = {
  getSynonyms,
  generateTasks,
  createDrawing,
  functionCalling, 
  generateTasks, 
  separateByRoles
}
