const Tag = require("../models/Tag")

exports.createTag = async (req, res) => {
    try {
        const { name, description } = req.body
        if (!name || !description) {
            return res.status(400).json({ message: "name and description are required" })
        }
        const Tagdetails = await Tag.create({
            name: name,
            description: description,
        })
        console.log(Tagdetails);
        return res.status(201).json({ message: "Tag created successfully", Tagdetails })
    }
    catch (Err) {
        console.log(Err.message)
        return res.status(500).json({ success: false, message: "tag creation failed" })
    }
}

exports.showAllTags = async (req, res) => {
    try {
        const tags = await Tag.find({}, {
            name: true,
            description: true
        })
        return res.status(201).json({
            message: "tags fetched successfully",
            tags,
        })
    }
    catch (error) {
        console.log(error.message)
        return res.status(500).json({
            success: false,
            message: "Failed to fetch tags"
        })
    }
}