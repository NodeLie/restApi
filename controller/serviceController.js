const {User, Dish, Comment} = require('../models/models')
const jwt = require('jsonwebtoken')
const sequelize = require('../db')
const { Op } = require('sequelize')

const generateJwt = (id, login, role) => {
    return jwt.sign(
        {id, login, role},
        process.env.SECRET_KEY,
        {expiresIn: '24h'}
    )
}

class serviceController {
  async authentication(request, response) {
    const { login, password } = request.body
    const user = await User.findOne({ where: { login, password } })
    // return response.status(200).json({test})
    if (user) {
      response.statusMessage = "Successful authorization"
      response.status(200).json({
        id: user.id,
        login: user.login,
        status: true,
        token: generateJwt(user.id, user.login, user.role),
      })
    } else {
      response.statusMessage = "Invalid authorization data"
      response
        .status(401)
        .json({ status: false, message: "Invalid authorization data" })
    }
  }
  async logout() {}
  async addDish(request, response) {
    let files = request.file
    if (request.user.role === "admin") {
      if (files.size < 2000000) {
        try {
          const { title, anons, text, tags } = request.body
          const dish = await Dish.create({
            title,
            anons,
            text,
            tags,
            img: files.filename,
          })
          //return response.status(200).json({dish})
          response.statusMessage = "Successful creation"
          response.status(201).json({
            status: true,
            post_id: dish.id,
          })
        } catch (e) {
          response.statusMessage = "Creating error"
          response.status(400).json({
            status: false,
            message: {
              error: e.name,
              detail: e.original.detail,
            },
          })
        }
      } else {
        response.statusMessage = "Creating error"
        response.status(400).json({
          status: false,
          message: "Photo too large",
        })
      }
    } else {
      response.statusMessage = "Permission denied"
      response.status(400).json({
        status: false,
        message: "Permission denied",
      })
    }
  }
  async updateDish(request, response) {
    const { id } = request.params
    const { title, anons, text, tags } = request.body
    let files = request.file

    const dish = await Dish.findOne({ where: { id } })
    if (!dish) {
      response.statusMessage = "Post not found"
      return response.status(404).json({
        message: "Post not found",
      })
    }

    if (request.user.role === "admin") {
      try {
        const dishUpdate = Dish.update(
          {
            title,
            anons,
            text,
            tags,
            img: files.filename,
          },
          {
            where: { id },
          }
        )
        let dishUpdated = await Dish.findOne({
          attributes: [
            "id",
            "title",
            [
              sequelize.fn(
                "to_char",
                sequelize.col("createdAt"),
                "HH24:mi dd.mm.YYYY"
              ),
              "datatime",
            ],
            "anons",
            "text",
            "tags",
            ["img", "image"],
          ],
          where: { id },
        })
        response.statusMessage = "Successful creation"
        return response.status(201).json({
          status: true,
          post: {
            title: dishUpdated.title,
            datatime: dishUpdated.datatime,
            anons: dishUpdated.anons,
            text: dishUpdated.text,
            tags: dishUpdated.tags,
            image: dishUpdated.image,
          },
        })
      } catch (e) {
        response.statusMessage = "Editing error"
        response.status(400).json({
          status: false,
          message: {
            error: e.name,
            detail: e.original.detail,
          },
        })
      }
    } else {
      response.statusMessage = "Permission denied"
      response.status(400).json({
        status: false,
        message: "Permission denied",
      })
    }
  }
  async getAllDishes(request, response) {
    const dishes = await Dish.findAll({
      attributes: [
        "title",
        [
          sequelize.fn(
            "to_char",
            sequelize.col("createdAt"),
            "HH24:mi dd.mm.YYYY"
          ),
          "datatime",
        ],
        "anons",
        "text",
        "tags",
        ["img", "image"],
      ],
    })
    response.statusMessage = "List posts"
    response.status(201).json({
      dishes,
    })
  }
  async getOneDish(request, response) {
    const { id } = request.params

    if (!id)
      return response.status(400).json({
        message: "Не указан id",
        status: false,
      })

    const dish = await Dish.findOne({
      attributes: [
        "id",
        "title",
        [
          sequelize.fn(
            "to_char",
            sequelize.col("createdAt"),
            "HH24:mi dd.mm.YYYY"
          ),
          "datatime",
        ],
        "anons",
        "text",
        "tags",
        ["img", "image"],
      ],
      where: { id },
    })

    if (!dish) {
      response.statusMessage = "Post not found"
      return response.status(404).json({
        message: "Post not found",
      })
    }

    const comments = await Comment.findAll({
      attributes: [
        ["id", "comment_id"],
        [
          sequelize.fn(
            "to_char",
            sequelize.col("createdAt"),
            "HH24:mi dd.mm.YYYY"
          ),
          "datatime",
        ],
        "author",
        "comment",
      ],
      where: { dishId: dish.id },
    })
    const result = {
      title: dish.title,
      datatime: dish.datatime,
      anons: dish.anons,
      text: dish.text,
      tags: dish.tags,
      image: dish.image,
      comments: comments,
    }
    response.statusMessage = "View post"
    return response.status(200).json({
      result,
    })
  }
  async addComment(request, response) {
    const {id: dishId} = request.params   
    const dish = await Dish.findOne({where: { id:dishId }})
    if (dish === null){
      response.statusMessage = "Post not found"
      response.status(404).json({
        message: "Post not found"
      })
    }    
    try {
      let { author, comment } = request.body
      let user
      let userId = null

      const authHeader = request.headers['authorization']
      const token = authHeader && authHeader.split(' ')[1]
      if (token !== null) user = jwt.decode(token)
      if (user) 
      {
        userId = user.id
        author = user.login
      }
      // userId = 'gg'
      const result = await Comment.create({
        author,
        comment,
        dishId,
        userId
      })
      response.statusMessage = "Successful creation"
      response.status(201).json({
        status: true,
        result: result
      })
    } catch (e) {
      response.statusMessage = "Creating error"
      response.status(400).json({
        status: false,
        message: {
          status: false,
          message: e
        },
      })
    }
  }
  async deleteComment(request, response) {
    if (request.user.role == "admin") {
      const {dishId, commentId} = request.params
      const dish = await Dish.findOne({where: { id:dishId }})
      if (dish === null) {
        response.statusMessage = "Post not found"
        return response.status(404).json({
          message: "Post not found"
        })
      }
      const comment = await Comment.findOne({where: { id:commentId }})
      if (comment === null) {
        response.statusMessage = "Comment not found"
        return response.status(404).json({
          message: "Comment not found"
        })
      } 
      try {
        await Comment.destroy({where: {id:commentId}})
        response.statusMessage = "Successful delete"
        response.status(201).json({
          status: true,
        })
      } catch (e) {
        response.statusMessage = "Error deleting"
        response.status(400).json({
          status: false,
          error: e
        })
      }
    } else {
      response.statusMessage = "Permission denied"
      response.status(400).json({
        status: false,
        message: "Permission denied",
      })
    }
  }
  async deleteDish(request, response) {
    if (request.user.role == "admin") {
      const {id:dishId} = request.params
      const dish = await Dish.findOne({where: { id:dishId }})
      if (dish === null) {
        response.statusMessage = "Post not found"
        return response.status(404).json({
          message: "Post not found"
        })
      }      
      try {
        await Dish.destroy({where: {id:dishId}})
        response.statusMessage = "Successful delete"
        response.status(201).json({
          status: true,
        })
      } catch (e) {
        response.statusMessage = "Error deleting"
        response.status(400).json({
          status: false,
          error: e
        })
      }
    } else {
      response.statusMessage = "Permission denied"
      response.status(400).json({
        status: false,
        message: "Permission denied",
      })
    }
  }
  async getDishByTag(request, response) {
    const {tagName} = request.params
    try {
      const dishes = await Dish.findAll({
        attributes: [
          "title",
          [
            sequelize.fn(
              "to_char",
              sequelize.col("createdAt"),
              "HH24:mi dd.mm.YYYY"
            ),
            "datatime",
          ],
          "anons",
          "text",          
          "tags",
          ["img", "image"],
        ],
        where:{
          tags:{
            [Op.like]:`%${tagName}%`
          }
        }
      })
      
      dishes.map(element => {
        let tags = element.tags.split(",").map(tag=>tag.trim())
        element.tags = tags
      })

      response.statusMessage = "Found posts"
      return response.status(200).json({
        dishes
      })
    } catch (e) {
      response.statusMessage = "Founding error"
      response.status(400).json({
        status: false,
        message: {
          status: false,
          message: e
        },
      })
    }
  }
}

module.exports = new serviceController()