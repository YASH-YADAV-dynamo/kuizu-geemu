#!/usr/bin/env node
import inquirer from 'inquirer';
import fs from 'fs';

async function main() {
    const { numQuestions } = await inquirer.prompt({
        type: 'number',
        name: 'numQuestions',
        message: 'How many questions do you want to create?',
        validate(value) {
            const valid = !isNaN(value) && value > 0;
            return valid || 'Please enter a positive number';
        }
    });

    const questions = [];

    for (let i = 0; i < numQuestions; i++) {
        console.log(`\nQuestion ${i + 1}`);
        const { question } = await inquirer.prompt({
            type: 'input',
            name: 'question',
            message: 'Enter the question:',
        });

        const choices = [];
        for (let j = 0; j < 4; j++) {
            const { choice } = await inquirer.prompt({
                type: 'input',
                name: 'choice',
                message: `Enter option ${j + 1}:`,
            });
            choices.push(choice);
        }

        const { correctAnswer } = await inquirer.prompt({
            type: 'list',
            name: 'correctAnswer',
            message: 'Select the correct answer:',
            choices,
        });

        questions.push({
            question,
            choices,
            correctAnswer,
        });
    }

    const testContent = generateTestFileContent(questions);
    fs.writeFileSync('test.js', testContent);
    console.log('Test file "test.js" created successfully.');
}

function generateTestFileContent(questions) {
    return `#!/usr/bin/env node
import chalk from 'chalk';
import inquirer from 'inquirer';
import gradient from 'gradient-string';
import chalkAnimation from 'chalk-animation';
import figlet from 'figlet';
import { createSpinner } from 'nanospinner';

let playerName;

const sleep = (ms = 2000) => new Promise((r) => setTimeout(r, ms));

async function welcome() {
    const rainbowTitle = chalkAnimation.rainbow('Welcome to the game!\\n');
    await sleep();
    rainbowTitle.stop();
    console.log(\`\${chalk.bgGreen('HOW TO PLAY')}
    I am your virtual \${chalk.blue('interviewer')}. I will ask you some questions.
    If you get any question wrong I will be \${chalk.red('killed')}
    So pass the interview with all correct answers.....

    \`);
}

async function askDetails() {
    const answers = await inquirer.prompt({
        type: 'input',
        name: 'name',
        message: 'What is your name?',
        default() {
            return 'Player';
        },
    });
    playerName = answers.name;
}

${generateQuestionFunctions(questions)}

async function handleAnswer(isCorrect) {
    const spinner = createSpinner('Checking your answer...').start();
    await sleep();

    if (isCorrect) {
        spinner.success({ text: \`Nice work \${playerName}! You are closer to the job!\` });
    } else {
        spinner.error({ text: \`HEHE! Sorry \${playerName}! You are not getting the job!\` });
        await restartGame();
    }
}

async function restartGame() {
    const answers = await inquirer.prompt({
        name: 'restart',
        type: 'confirm',
        message: 'Do you want to restart the game?',
    });

    if (answers.restart) {
        await startGame();
    } else {
        console.log(chalk.bgBlue('Thank you for playing!'));
        process.exit(0);
    }
}

async function startGame() {
    ${questions.map((_, index) => `await question${index + 1}();`).join('\n    ')}
    winner();
}

function winner() {
    console.clear();
    const msg = \`Congrats, \${playerName}! You are hired! \\n$ 1,000,000\`;

    figlet(msg, (err, data) => {
        if (err) {
            console.log('Something went wrong...');
            console.dir(err);
            return;
        }
        console.log(gradient.pastel.multiline(data));
        console.log(chalk.bgBlue('Thank you for playing!'));
        process.exit(0);
    });
}

await welcome();
await askDetails();
await startGame();
`;
}

function generateQuestionFunctions(questions) {
    return questions.map((q, index) => `
async function question${index + 1}() {
    const answers = await inquirer.prompt({
        name: 'question${index + 1}',
        type: 'list',
        message: '${q.question.replace(/'/g, "\\'")}\\n',
        choices: ${JSON.stringify(q.choices)},
    });
    return handleAnswer(answers.question${index + 1} === '${q.correctAnswer.replace(/'/g, "\\'")}');
}
`).join('');
}

main().catch(err => console.error(err));
