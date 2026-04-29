// FULL 100% SPEC - FITNESS APP (ANTD + RECHARTS - REACT 17 SAFE)
import React, { useMemo, useState } from "react";
import {
  Layout, Card, Row, Col, Table, Button, Modal, Form, Input, Select,
  DatePicker, Tag, Progress, Popconfirm, Drawer, Segmented,
  InputNumber, Space, Timeline
} from "antd";
import dayjs from "dayjs";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, ResponsiveContainer
} from "recharts";

const { Header, Content } = Layout;
const { RangePicker } = DatePicker;

// ===== BMI =====
const calcBMI = (w:number,h:number)=>+(w/((h/100)**2)).toFixed(1);
const bmiTag=(b:number)=> b<18.5?["blue","Thiếu cân"]:b<25?["green","Bình thường"]:b<30?["gold","Thừa cân"]:["red","Béo phì"];

export default function App(){
  const [workouts,setWorkouts]=useState<any[]>([]);
  const [health,setHealth]=useState<any[]>([]);
  const [goals,setGoals]=useState<any[]>([]);
  const [exercises,setExercises]=useState<any[]>([]);

  // ===== MODAL STATE =====
  const [wModal,setWModal]=useState(false);
  const [editingW,setEditingW]=useState<any>();
  const [wForm]=Form.useForm();

  const [hModal,setHModal]=useState(false);
  const [editingH,setEditingH]=useState<any>();
  const [hForm]=Form.useForm();

  const [gDrawer,setGDrawer]=useState(false);
  const [gForm]=Form.useForm();
  const [gFilter,setGFilter]=useState("all");

  const [eModal,setEModal]=useState(false);
  const [editingE,setEditingE]=useState<any>();
  const [detailE,setDetailE]=useState<any>();
  const [eForm]=Form.useForm();

  // ===== FILTER =====
  const [search,setSearch]=useState("");
  const [typeFilter,setTypeFilter]=useState<string>();
  const [range,setRange]=useState<any>();

  const filteredWorkouts = workouts.filter(w=>{
    return (!search || w.type?.toLowerCase().includes(search.toLowerCase()))
    && (!typeFilter || w.type===typeFilter)
    && (!range || (dayjs(w.date).isAfter(range[0]) && dayjs(w.date).isBefore(range[1])));
  });

  // ===== DASHBOARD =====
  const thisMonth = workouts.filter(w=>dayjs(w.date).month()===dayjs().month());
  const totalSessions = thisMonth.length;
  const totalCalories = thisMonth.reduce((a,b)=>a+(b.cal||0),0);

  const streak = useMemo(()=>{
    const days=new Set(workouts.filter(w=>w.status==="Hoàn thành").map(w=>dayjs(w.date).format("YYYY-MM-DD")));
    let s=0,d=dayjs();
    while(days.has(d.format("YYYY-MM-DD"))){s++;d=d.subtract(1,"day");}
    return s;
  },[workouts]);

  const goalPercent = goals.length?Math.round(goals.filter(g=>g.status==="Đã đạt").length/goals.length*100):0;

  const weekly = [1,2,3,4,5].map(w=>({week:`W${w}`,value:thisMonth.filter(x=>Math.ceil(dayjs(x.date).date()/7)===w).length}));
  const weightData = health.map(h=>({date:dayjs(h.date).format("DD/MM"),weight:h.weight}));

  const recent = [...workouts].slice(-5).reverse();

  // ===== CRUD =====
  const saveWorkout=()=>{
    wForm.validateFields().then(v=>{
      const data={...v,date:v.date.toISOString(),key:editingW?.key||Date.now()};
      setWorkouts(editingW?workouts.map(w=>w.key===editingW.key?data:w):[...workouts,data]);
      setWModal(false);setEditingW(null);
    });
  };

  const saveHealth=()=>{
    hForm.validateFields().then(v=>{
      const data={...v,date:v.date.toISOString(),key:editingH?.key||Date.now()};
      setHealth(editingH?health.map(h=>h.key===editingH.key?data:h):[...health,data]);
      setHModal(false);setEditingH(null);
    });
  };

  const saveGoal=()=>{
    gForm.validateFields().then(v=>{
      setGoals([...goals,{...v,key:Date.now(),status:"Đang thực hiện"}]);
      setGDrawer(false);
    });
  };

  const saveExercise=()=>{
    eForm.validateFields().then(v=>{
      const data={...v,key:editingE?.key||Date.now()};
      setExercises(editingE?exercises.map(e=>e.key===editingE.key?data:e):[...exercises,data]);
      setEModal(false);setEditingE(null);
    });
  };

  return (
    <Layout style={{minHeight:"100vh"}}>
      <Header style={{color:"#fff"}}>Fitness App</Header>
      <Content style={{padding:20}}>

        {/* DASHBOARD */}
        <Row gutter={16}>
          <Col span={6}><Card>Buổi tập: {totalSessions}</Card></Col>
          <Col span={6}><Card>Calo: {totalCalories}</Card></Col>
          <Col span={6}><Card>Streak: {streak}</Card></Col>
          <Col span={6}><Card><Progress percent={goalPercent}/></Card></Col>
        </Row>

        <Row gutter={16} style={{marginTop:20}}>
          <Col span={12}><Card>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weekly}><XAxis dataKey="week"/><YAxis/><Tooltip/><Bar dataKey="value"/></BarChart>
            </ResponsiveContainer>
          </Card></Col>
          <Col span={12}><Card>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weightData}><XAxis dataKey="date"/><YAxis/><Tooltip/><Line dataKey="weight"/></LineChart>
            </ResponsiveContainer>
          </Card></Col>
        </Row>

        <Card title="Timeline" style={{marginTop:20}}>
          <Timeline items={recent.map(r=>({children:`${dayjs(r.date).format("DD/MM")} - ${r.type}`}))}/>
        </Card>

        {/* WORKOUT FULL */}
        <Card title="Workout" extra={<Button onClick={()=>{setEditingW(null);wForm.resetFields();setWModal(true);}}>Thêm</Button>}>
          <Space>
            <Input placeholder="Search" onChange={e=>setSearch(e.target.value)}/>
            <Select style={{width:120}} onChange={setTypeFilter} options={["Cardio","Strength","Yoga","HIIT","Other"].map(v=>({value:v}))}/>
            <RangePicker onChange={setRange}/>
          </Space>
          <Table dataSource={filteredWorkouts} columns={[
            {title:"Ngày",dataIndex:"date",render:d=>dayjs(d).format("DD/MM")},
            {title:"Loại",dataIndex:"type"},
            {title:"Phút",dataIndex:"dur"},
            {title:"Calo",dataIndex:"cal"},
            {title:"Ghi chú",dataIndex:"note"},
            {title:"Trạng thái",dataIndex:"status",render:s=><Tag>{s}</Tag>},
            {title:"",render:(_,r:any)=>(<Space>
              <Button onClick={()=>{setEditingW(r);wForm.setFieldsValue({...r,date:dayjs(r.date)});setWModal(true);}}>Sửa</Button>
              <Popconfirm title="Xóa" onConfirm={()=>setWorkouts(workouts.filter(w=>w.key!==r.key))}><Button danger>Xóa</Button></Popconfirm>
            </Space>)}
          ]}/>
        </Card>

        {/* HEALTH */}
        <Card title="Health" style={{marginTop:20}} extra={<Button onClick={()=>setHModal(true)}>Thêm</Button>}>
          <Table dataSource={health} columns={[
            {title:"Ngày",dataIndex:"date"},
            {title:"Cân",dataIndex:"weight"},
            {title:"Cao",dataIndex:"height"},
            {title:"BMI",render:(_,r)=>{const b=calcBMI(r.weight,r.height);const t=bmiTag(b);return <Tag color={t[0]}>{b}-{t[1]}</Tag>}},
            {title:"Tim",dataIndex:"heart"},
            {title:"Ngủ",dataIndex:"sleep"},
            {title:"",render:(_,r:any)=>(<Space>
              <Button onClick={()=>{setEditingH(r);hForm.setFieldsValue({...r,date:dayjs(r.date)});setHModal(true);}}>Sửa</Button>
              <Popconfirm title="Xóa" onConfirm={()=>setHealth(health.filter(h=>h.key!==r.key))}><Button danger>Xóa</Button></Popconfirm>
            </Space>)}
          ]}/>
        </Card>

        {/* GOALS */}
        <Card title="Goals" style={{marginTop:20}} extra={<Button onClick={()=>setGDrawer(true)}>Thêm</Button>}>
          <Segmented options={["all","Đang thực hiện","Đã đạt","Đã hủy"]} onChange={v=>setGFilter(v as string)}/>
          <Row>
            {goals.filter(g=>gFilter==="all"||g.status===gFilter).map(g=>{
              const percent=Math.round((g.current/g.target)*100);
              return <Col span={8}><Card title={g.name} extra={<Popconfirm title="Xóa" onConfirm={()=>setGoals(goals.filter(x=>x.key!==g.key))}><Button danger>Xóa</Button></Popconfirm>}>
                <InputNumber value={g.current} onChange={(v)=>{
                  setGoals(goals.map(x=>x.key===g.key?{...x,current:v,status:v>=x.target?"Đã đạt":"Đang thực hiện"}:x));
                }}/>
                <p>Deadline: {g.deadline}</p>
                <Progress percent={percent}/>
              </Card></Col>
            })}
          </Row>
        </Card>

        {/* EXERCISE */}
        <Card title="Exercise" style={{marginTop:20}} extra={<Button onClick={()=>setEModal(true)}>Thêm</Button>}>
          <Row>
            {exercises.map(e=>(<Col span={8}><Card title={e.name} onClick={()=>setDetailE(e)}>
              {e.group} <Tag>{e.level}</Tag>
              <p>{e.cal}/h</p>
            </Card></Col>))}
          </Row>
        </Card>

        {/* MODALS */}
        <Modal open={wModal} onOk={saveWorkout} onCancel={()=>setWModal(false)}>
          <Form form={wForm} layout="vertical">
            <Form.Item name="date" label="Ngày"><DatePicker/></Form.Item>
            <Form.Item name="type"><Select options={["Cardio","Strength","Yoga","HIIT","Other"].map(v=>({value:v}))}/></Form.Item>
            <Form.Item name="dur"><InputNumber style={{width:"100%"}}/></Form.Item>
            <Form.Item name="cal"><InputNumber style={{width:"100%"}}/></Form.Item>
            <Form.Item name="note"><Input/></Form.Item>
            <Form.Item name="status"><Select options={[{value:"Hoàn thành"},{value:"Bỏ lỡ"}]}/></Form.Item>
          </Form>
        </Modal>

        <Modal open={hModal} onOk={saveHealth} onCancel={()=>setHModal(false)}>
          <Form form={hForm} layout="vertical">
            <Form.Item name="date"><DatePicker/></Form.Item>
            <Form.Item name="weight"><InputNumber style={{width:"100%"}}/></Form.Item>
            <Form.Item name="height"><InputNumber style={{width:"100%"}}/></Form.Item>
            <Form.Item name="heart"><InputNumber style={{width:"100%"}}/></Form.Item>
            <Form.Item name="sleep"><InputNumber style={{width:"100%"}}/></Form.Item>
          </Form>
        </Modal>

        <Drawer open={gDrawer} onClose={()=>setGDrawer(false)}>
          <Form form={gForm} layout="vertical">
            <Form.Item name="name"><Input/></Form.Item>
            <Form.Item name="type"><Select options={["Giảm cân","Tăng cơ","Cải thiện","Khác"].map(v=>({value:v}))}/></Form.Item>
            <Form.Item name="target"><InputNumber/></Form.Item>
            <Form.Item name="current"><InputNumber/></Form.Item>
            <Form.Item name="deadline"><DatePicker/></Form.Item>
            <Button onClick={saveGoal}>Save</Button>
          </Form>
        </Drawer>

        <Modal open={eModal} onOk={saveExercise} onCancel={()=>setEModal(false)}>
          <Form form={eForm} layout="vertical">
            <Form.Item name="name"><Input/></Form.Item>
            <Form.Item name="group"><Select options={["Chest","Back","Legs","Shoulders","Arms","Core","Full Body"].map(v=>({value:v}))}/></Form.Item>
            <Form.Item name="level"><Select options={["Dễ","Trung bình","Khó"].map(v=>({value:v}))}/></Form.Item>
            <Form.Item name="cal"><InputNumber/></Form.Item>
            <Form.Item name="desc"><Input/></Form.Item>
          </Form>
        </Modal>

        <Modal open={!!detailE} onCancel={()=>setDetailE(null)} footer={null}>
          <h3>{detailE?.name}</h3>
          <p>{detailE?.desc}</p>
        </Modal>

      </Content>
    </Layout>
  );
}
