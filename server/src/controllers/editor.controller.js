import "dotenv/config";
import axios from 'axios';

export async function runCode(req, res, next) {
    try {
        console.log(req.body);
        const header = {
            "Content-Type": "application/json",
            "X-Auth-Token": process.env.X_AUTH_TOKEN,
        };
        const body = {
            "source_code": req.body.source_code || "",
            "language_id": req.body.language_id || 71,
            "stdin": req.body.stdin || "",
            "expected_output": req.body.expected_output || "",
        };
        const response = await axios.post(process.env.JUDGE_ZERO_API + "/submissions", body, { header });
        const submission_token = response.data.token;
    
        try {

            let response;
            do {
                response = await axios.get(process.env.JUDGE_ZERO_API + "/submissions/" + submission_token);
            }while(response.data.status.id == 1);
            console.log(response.data);

            res.status(200).json({  "stdout": response.data.stdout, 
                                    "stderr": response.data.stderr, 
                                    "description": response.data.status.description,
                                    "compile_output": response.data.compile_output, 
            });

        } catch (error) {
            console.log(error);
            next(error);
        }
    } catch (e) {
        console.log(e);
        next(e);
    }
}