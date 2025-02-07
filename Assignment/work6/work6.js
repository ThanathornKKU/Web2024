const RB = ReactBootstrap;
const { Alert, Card, Button, Table } = ReactBootstrap;

// ใช้ config จาก Firebase Project Setting
const firebaseConfig = {
  apiKey: "AIzaSyC7sQCAI8AT2exswnTEdVE0DV1UkWmO3i4",
  authDomain: "web2567-9de8c.firebaseapp.com",
  projectId: "web2567-9de8c",
  storageBucket: "web2567-9de8c.appspot.com",
  messagingSenderId: "820849363502",
  appId: "1:820849363502:web:bc8777ef20f771334c2dbf",
  measurementId: "G-5J0KXCQPE1"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

function EditButton({ std, app }) {
  return <Button style={{ width: 'auto', marginRight: '10px' }} onClick={() => app.edit(std)}>Edit ✏️</Button>;
}

function DeleteButton({ std, app }) {
  return <Button style={{ width: 'auto' }} onClick={() => app.delete(std)}>Delete 🗑️</Button>;
}
// ✅ Component StudentTable (ใช้ Array.map)
function StudentTable({ data, app }) {
  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>รหัส</th>
          <th>คำนำหน้า</th>
          <th>ชื่อ</th>
          <th>สกุล</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {data.length > 0 ? (
          data.map((s) => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>{s.title}</td>
              <td>{s.fname}</td>
              <td>{s.lname}</td>
              <td>{s.email}</td>
              <td>{s.phone || "N/A"}</td>
              <td style={{ display: 'flex', justifyContent: 'center' }}>
                <EditButton std={s} app={app} />
                <DeleteButton std={s} app={app} />
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="7" className="text-center">
              No student data found.
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
}
// ✅ Component TextInput สำหรับใส่ข้อมูลนักศึกษา
function TextInput({ label, app, value, style }) {
  return (
    <label className="form-label">
      {label}:
      <input
        className="form-control"
        style={style}
        value={app.state[value]}
        onChange={(ev) => {
          let s = {};
          s[value] = ev.target.value;
          app.setState(s);
        }}
      />
    </label>
  );
}
// นายธนธรณ์ จูหลาย 653380131-7
class App extends React.Component {
  state = {
    students: [],
    stdid: "",
    stdtitle: "",
    stdfname: "",
    stdlname: "",
    stdemail: "",
    stdphone: "",
    unsubscribe: null,
    // สำหรับ Login
    scene: 0,
    user: null,
  };
  // ✅ ฟังก์แก้ไขข้อมูลนักศึกษา
  edit = (std) => {
    this.setState({
      stdid: std.id,
      stdtitle: std.title,
      stdfname: std.fname,
      stdlname: std.lname,
      stdemail: std.email,
      stdphone: std.phone,
    });
  };
  // ✅ ฟังก์ลบข้อมูลนักศึกษา
  delete = (std) => {
    if (confirm("❗ต้องการลบข้อมูลนี้?")) {
      db.collection("students").doc(std.id).delete()
        .then(() => alert("✅ ลบข้อมูลสำเร็จ"))
        .catch((error) => console.error("❌ ลบข้อมูลผิดพลาด:", error));
    }
  };
  // ✅ ฟังก์ชันดึงข้อมูลแบบ manual
  readData = () => {
    db.collection("students")
      .get()
      .then((querySnapshot) => {
        let stdlist = [];
        querySnapshot.forEach((doc) => {
          stdlist.push({ id: doc.id, ...doc.data() });
        });
        console.log("📌 Read Data:", stdlist);
        this.setState({ students: stdlist });
      })
      .catch((error) => console.error("❌ Error fetching students:", error));
  };
  // ✅ ฟังก์ชันดึงข้อมูลแบบ Real-Time
  autoRead = () => {
    if (this.state.unsubscribe) {
      console.warn("❗ Auto Read is already running");
      return;
    }
    const unsubscribe = db.collection("students").onSnapshot((querySnapshot) => {
      let stdlist = [];
      querySnapshot.forEach((doc) => {
        stdlist.push({ id: doc.id, ...doc.data() });
      });

      console.log("🔄 Auto Read Updated:", stdlist);
      this.setState({ students: stdlist });
    });

    this.setState({ unsubscribe });
  };
  // ✅ ฟังก์ชันหยุดการอ่านข้อมูลแบบ Auto Read
  stopAutoRead = () => {
    if (this.state.unsubscribe) {
      this.state.unsubscribe(); // หยุด onSnapshot listener
      this.setState({ unsubscribe: null });
      console.log("⏹️ Auto Read Stopped");
    } else {
      console.warn("❗ Auto Read is not active");
    }
  };
  // ✅ ฟังก์ชันเพิ่มข้อมูลนักศึกษาเข้า Firestore
  insertData = () => {
    const { stdid, stdtitle, stdfname, stdlname, stdemail, stdphone } = this.state;

    // ตรวจสอบว่ามีช่องใดที่ยังไม่ได้กรอกหรือไม่
    if (!stdid || !stdtitle || !stdfname || !stdlname || !stdemail || !stdphone) {
      alert("❗ กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    db.collection("students")
      .doc(stdid)
      .set({
        title: stdtitle,
        fname: stdfname,
        lname: stdlname,
        phone: stdphone,
        email: stdemail,
      })
      .then(() => {
        alert("✅ เพิ่มข้อมูลสำเร็จ!");
        this.setState({
          stdid: "",
          stdtitle: "",
          stdfname: "",
          stdlname: "",
          stdemail: "",
          stdphone: "",
        });
      })
      .catch((error) => console.error("❌ Error inserting student:", error));
  };

  render() {
    return (
      <Card>
        <Card.Header>
          <div className="text-end">
            <LoginBox user={this.state.user} app={this}>Login Box</LoginBox>
          </div>
        </Card.Header>
        <Card.Body>
          <Button onClick={this.readData}>Read Data</Button>
          <Button onClick={this.autoRead} className="ms-2 text-light" variant="warning">Auto Read</Button>
          <Button onClick={this.stopAutoRead} className="ms-2" variant="danger">Stop Auto Read</Button>
          <div className="mt-3">
          <h5 className="mt-2"><b>ข้อมูลนักศึกษา :</b></h5>
            <StudentTable data={this.state.students} app={this} />
          </div>
        </Card.Body>

        <Card.Footer>
          <h5 className="mt-2"><b>เพิ่ม/แก้ไขข้อมูล นักศึกษา :</b></h5>
          <TextInput label="รหัส" app={this} value="stdid" style={{ width: '150px', marginRight: '10px' }} />
          <TextInput label="คำนำหน้า" app={this} value="stdtitle" style={{ width: '100px', marginRight: '10px' }} />
          <TextInput label="ชื่อ" app={this} value="stdfname" style={{ width: '200px', marginRight: '10px' }} />
          <TextInput label="นามสกุล" app={this} value="stdlname" style={{ width: '200px', marginRight: '10px' }} />
          <TextInput label="Email" app={this} value="stdemail" style={{ width: '200px', marginRight: '10px' }} />
          <TextInput label="Phone" app={this} value="stdphone" style={{ width: '200px', marginRight: '10px' }} />
          <Button onClick={this.insertData} className="ms-2 mb-1 text-light" variant="success" style={{ width: '100px' }}>Save</Button>
        </Card.Footer>


      </Card>
    );
  }
  ///////////////////////////////////////////////////////////////////// Login /////////////////////////////////////////////////////////////////////

  constructor() {
    super();
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({ user: user.toJSON() });
      } else {
        this.setState({ user: null });
      }
    });
  }

  google_login() {
    // Using a popup.
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope("profile");
    provider.addScope("email");
    firebase.auth().signInWithPopup(provider);
  }

  google_logout() {
    if (confirm("Are you sure?")) {
      firebase.auth().signOut();
    }
  }

}

function LoginBox(props) {
  const u = props.user;
  const app = props.app;
  if (!u) {
    return <div><Button onClick={() => app.google_login()}>Login</Button></div>
  } else {
    return <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end', // ชิดขวา
      gap: '10px' // เพิ่มระยะห่างระหว่างองค์ประกอบ
    }}>
      <img src={u.photoURL} style={{
        borderRadius: '50%', // Makes the image round
        width: '50px', // Optional: Set width for consistency
        height: '50px', // Optional: Set height for consistency
        objectFit: 'cover',
        marginRight: '10px' // Ensures the image fits within the circle without stretching
      }} />
      <div style={{ textAlign: 'left' }}>
        {u.displayName} <br />
        {u.email}
      </div>
      <Button onClick={() => app.google_logout()} style={{ marginLeft: '10px' }}>Logout</Button>
    </div>
  }
}



const container = document.getElementById("myapp");
const root = ReactDOM.createRoot(container);
root.render(<App />);
