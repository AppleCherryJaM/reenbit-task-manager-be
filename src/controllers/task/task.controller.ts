import { Response } from 'express';
import { prisma } from '../../lib/prisma';
import {
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskParamsRequest,
  AssigneeOperationRequest
} from './task.types';

class TaskController {
	constructor() {
    this.getTasks = this.getTasks.bind(this);
    this.getTaskById = this.getTaskById.bind(this);
    this.createTask = this.createTask.bind(this);
    this.updateTask = this.updateTask.bind(this);
    this.deleteTask = this.deleteTask.bind(this);
  }

  private readonly taskIncludeConfig = {
    author: {
      select: {
        id: true,
        name: true,
        email: true
      }
    },
    assignees: {
      select: {
        id: true,
        name: true,
        email: true
      }
    }
  };

  private isValidStatus(status: string): boolean {
    const validStatuses = ['pending', 'in_progress', 'completed'];
    return validStatuses.includes(status);
  }

  private handleError(error: unknown, res: Response, defaultMessage: string) {
    console.error('Task Controller Error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Record to update not found') || 
          error.message.includes('Record to delete does not exist')) {
        return res.status(404).json({ error: 'Task not found' });
      }
      if (error.message.includes('Foreign key constraint')) {
        return res.status(400).json({ error: 'Related record not found' });
      }
      if (error.message.includes('Unique constraint')) {
        return res.status(400).json({ error: 'Assignee already assigned to this task' });
      }
    }
    
    res.status(500).json({ error: defaultMessage });
  }

  private async findTaskById(id: number) {
    return await prisma.task.findUnique({
      where: { id },
      include: this.taskIncludeConfig
    });
  }

  async getTasks(req: CreateTaskRequest, res: Response) {
    try {
      const tasks = await prisma.task.findMany({
        include: this.taskIncludeConfig,
        orderBy: { createdAt: 'desc' }
      });
      res.json(tasks);
    } catch (error) {
      this.handleError(error, res, 'Error while getting tasks');
    }
  }

  async getTaskById(req: TaskParamsRequest, res: Response) {
    try {
      const { id } = req.params;
      const task = await this.findTaskById(parseInt(id));

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      res.json(task);
    } catch (error) {
      this.handleError(error, res, 'Error while getting task');
    }
  }

  async createTask(req: CreateTaskRequest, res: Response) {
    try {
      const { title, description, status, authorId, assigneeIds } = req.body;

      // Валидация
      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }
      if (!authorId) {
        return res.status(400).json({ error: 'Author ID is required' });
      }

      const taskData = {
        title,
        description,
        status: status || 'pending',
        authorId,
        ...(assigneeIds && assigneeIds.length > 0 && {
          assignees: {
            connect: assigneeIds.map((id: number) => ({ id }))
          }
        })
      };

      const task = await prisma.task.create({
        data: taskData,
        include: this.taskIncludeConfig
      });

      res.status(201).json(task);
    } catch (error) {
      this.handleError(error, res, 'Error while creating task');
    }
  }

  async updateTask(req: UpdateTaskRequest, res: Response) {
  	try {
  	  const { id } = req.params;
  	  const { title, description, status, assigneeIds } = req.body;

    // Валидация статуса (если передан)
  	  if (status && !this.isValidStatus(status)) {
  	    return res.status(400).json({ 
  	      error: 'Invalid status. Allowed values: pending, in_progress, completed' 
  	    });
  	  }

  	  const updateData: any = {};
  	  if (title) updateData.title = title;
  	  if (description !== undefined) updateData.description = description;
  	  if (status) updateData.status = status;

  	  if (assigneeIds) {
  	    updateData.assignees = {
  	      set: assigneeIds.map((id: number) => ({ id }))
  	    };
  	  }

  	  const task = await prisma.task.update({
  	    where: { id: parseInt(id) },
  	    data: updateData,
  	    include: this.taskIncludeConfig
  	  });

  	  res.json(task);
  	} catch (error) {
  	  this.handleError(error, res, 'Error while updating task');
  	}
	}

  async deleteTask(req: TaskParamsRequest, res: Response) {
    try {
      const { id } = req.params;

      await prisma.task.delete({
        where: { id: parseInt(id) }
      });

      res.status(204).send();
    } catch (error) {
      this.handleError(error, res, 'Error while deleting task');
    }
  }

}

export const taskController = new TaskController();
export default taskController;