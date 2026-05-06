import React, { useEffect, useState } from "react";
import {
  Layout,
  Menu,
  Card,
  Row,
  Col,
  Table,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
} from "antd";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import dayjs from "dayjs";

const { Header, Content } = Layout;
const { Option } = Select;

type Status = "todo" | "inprogress" | "done";

interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string;
  priority: "High" | "Medium" | "Low";
  tag: string;
  status: Status;
}

const initialData: Task[] = [];

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [form] = Form.useForm();

  // Load từ localStorage
  useEffect(() => {
    const data = localStorage.getItem("tasks");
    if (data) setTasks(JSON.parse(data));
  }, []);

  // Save vào localStorage
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const openModal = (task?: Task) => {
    setEditingTask(task || null);
    setIsModalOpen(true);
    if (task) {
      form.setFieldsValue({
        ...task,
        deadline: dayjs(task.deadline),
      });
    } else {
      form.resetFields();
    }
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const newTask: Task = {
        id: editingTask?.id || Date.now().toString(),
        ...values,
        deadline: values.deadline.format("YYYY-MM-DD"),
        status: editingTask?.status || "todo",
      };

      if (editingTask) {
        setTasks((prev) =>
          prev.map((t) => (t.id === editingTask.id ? newTask : t))
        );
      } else {
        setTasks((prev) => [...prev, newTask]);
      }

      setIsModalOpen(false);
    });
  };

  // Drag & Drop
  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;

    setTasks((prev) =>
      prev.map((task) =>
        task.id === draggableId
          ? { ...task, status: destination.droppableId }
          : task
      )
    );
  };

  // Dashboard
  const dashboard = () => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === "done").length;
    const overdue = tasks.filter(
      (t) =>
        dayjs(t.deadline).isBefore(dayjs()) && t.status !== "done"
    ).length;

    return (
      <Row gutter={16}>
        <Col span={8}>
          <Card title="Tổng task">{total}</Card>
        </Col>
        <Col span={8}>
          <Card title="Hoàn thành">{done}</Card>
        </Col>
        <Col span={8}>
          <Card title="Quá hạn">{overdue}</Card>
        </Col>
      </Row>
    );
  };

  // Kanban
  const kanban = () => {
    const columns = {
      todo: tasks.filter((t) => t.status === "todo"),
      inprogress: tasks.filter((t) => t.status === "inprogress"),
      done: tasks.filter((t) => t.status === "done"),
    };

    const renderColumn = (key: Status, title: string) => (
      <Col span={8}>
        <Card title={title}>
          <Droppable droppableId={key}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {columns[key].map((task, index) => (
                  <Draggable
                    key={task.id}
                    draggableId={task.id}
                    index={index}
                  >
                    {(provided) => (
                      <Card
                        size="small"
                        style={{ marginBottom: 8 }}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <b>{task.title}</b>
                        <p>{task.description}</p>
                        <Tag>{task.priority}</Tag>
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </Card>
      </Col>
    );

    return (
      <DragDropContext onDragEnd={onDragEnd}>
        <Row gutter={16}>
          {renderColumn("todo", "Cần làm")}
          {renderColumn("inprogress", "Đang làm")}
          {renderColumn("done", "Hoàn thành")}
        </Row>
      </DragDropContext>
    );
  };

  // Table
  const columns = [
    {
      title: "Tên",
      dataIndex: "title",
    },
    {
      title: "Deadline",
      dataIndex: "deadline",
      sorter: (a: Task, b: Task) =>
        dayjs(a.deadline).unix() - dayjs(b.deadline).unix(),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      filters: [
        { text: "Cần làm", value: "todo" },
        { text: "Đang làm", value: "inprogress" },
        { text: "Hoàn thành", value: "done" },
      ],
      onFilter: (value: any, record: Task) =>
        record.status === value,
    },
    {
      title: "Priority",
      dataIndex: "priority",
      render: (p: string) => <Tag>{p}</Tag>,
    },
    {
      title: "Action",
      render: (_: any, record: Task) => (
        <Button onClick={() => openModal(record)}>Edit</Button>
      ),
    },
  ];

  return (
    <Layout>
      <Header>
        <Menu
          theme="dark"
          mode="horizontal"
          onClick={(e) => setCurrentPage(e.key)}
          items={[
            { key: "dashboard", label: "Dashboard" },
            { key: "kanban", label: "Kanban" },
            { key: "table", label: "Danh sách" },
          ]}
        />
      </Header>

      <Content style={{ padding: 20 }}>
        <Button type="primary" onClick={() => openModal()}>
          + Thêm task
        </Button>

        <div style={{ marginTop: 20 }}>
          {currentPage === "dashboard" && dashboard()}
          {currentPage === "kanban" && kanban()}
          {currentPage === "table" && (
            <Table dataSource={tasks} columns={columns} rowKey="id" />
          )}
        </div>
      </Content>

      <Modal
        title={editingTask ? "Sửa task" : "Thêm task"}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Tên task" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea />
          </Form.Item>

          <Form.Item name="deadline" label="Deadline" rules={[{ required: true }]}>
            <DatePicker />
          </Form.Item>

          <Form.Item name="priority" label="Priority">
            <Select>
              <Option value="High">Cao</Option>
              <Option value="Medium">Trung bình</Option>
              <Option value="Low">Thấp</Option>
            </Select>
          </Form.Item>

          <Form.Item name="tag" label="Tag">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default App;