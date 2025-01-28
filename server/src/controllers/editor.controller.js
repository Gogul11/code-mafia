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
        const response = await axios.post(process.env.JUDGE_ZERO_API + "/submissions/", body, { header });
        const submission_token = response.data.token;
    
        try {

            let response;
            do {
                response = await axios.get(process.env.JUDGE_ZERO_API + "/submissions/" + submission_token);
            }while(response.data.status.id <= 2);
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

export async function runBatchCode(req, res, next) {
    try {
        const header = {
            "Content-Type": "application/json",
            "X-Auth-Token": process.env.X_AUTH_TOKEN,
        };
        const response = await axios.post(process.env.JUDGE_ZERO_API + "/submissions/batch", req.body, { header });

        let submission_token = "";
        for (let i = 0; i < 3; i++) {
            if (submission_token != "" ) submission_token += "," + response.data[i].token;
            else submission_token += response.data[i].token;
        }

        try {

            let response;
            do {
                response = await axios.get(process.env.JUDGE_ZERO_API + "/submissions/batch?tokens=" + submission_token + "&fields=*");
            }while(response.data.submissions[0].status_id <= 2 || response.data.submissions[1].status_id <= 2 || response.data.submissions[2].status_id <= 2);

            res.status(200).json({"output": response.data});

        } catch (error) {
            console.log(error);
            next(error);
        }

    } catch (error) {
        console.log(error);
        next(error);
    }
}