import { validationResult } from "express-validator";
import Todo from "../models/Todo.js";
import User from "../models/User.js";
import { StatusCode } from "../utils/constants.js";
import { jsonGenerate } from "../utils/helpers.js";

export const createTodo = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json(
      jsonGenerate(
        StatusCode.VALIDATION_ERROR,
        "Validation error",
        errors.array()
      )
    );
  }

  const { title, desc, dueDate } = req.body;

  try {
    if (!title) {
      console.log("Title field cannot be empty");
      return res.json(
        jsonGenerate(StatusCode.VALIDATION_ERROR, "Title field cannot be empty")
      );
      
    }

    const newTodo = {
      userId: req.userId,
      title: title,
      desc: desc || "",
      dueDate: dueDate || null,
    };

    const result = await Todo.create(newTodo);

    if (result) {
      await User.findOneAndUpdate(
        { _id: req.userId },
        { $push: { todos: result } }
      );
      return res.json(
        jsonGenerate(StatusCode.SUCCESS, "Todo created successfully", result)
      );
    }
  } catch (error) {
    return res.json(
      jsonGenerate(
        StatusCode.UNPROCESSABLE_ENTITY,
        "Something went wrong",
        error.message || error
      )
    );
  }
};
