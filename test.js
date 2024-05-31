#!/usr/bin/env node
import chalk from 'chalk';
import inquirer from 'inquirer';
import gradient from 'gradient-string';
import chalkAnimation from 'chalk-animation';
import figlet from 'figlet';
import { createSpinner } from 'nanospinner';

let playerName;

const sleep = (ms = 2000) => new Promise((r) => setTimeout(r, ms));

async function welcome() {
    const rainbowTitle = chalkAnimation.rainbow('Welcome to the game!\n');
    await sleep();
    rainbowTitle.stop();
    console.log(`${chalk.bgGreen('HOW TO PLAY')}
    I am your virtual ${chalk.blue('interviewer')}. I will ask you some questions.
    If you get any question wrong I will be ${chalk.red('killed')}
    So pass the interview with all correct answers.....

    `);
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


async function question1() {
    const answers = await inquirer.prompt({
        name: 'question1',
        type: 'list',
        message: 'd\n',
        choices: ["f","f","d","d"],
    });
    return handleAnswer(answers.question1 === 'f');
}


async function handleAnswer(isCorrect) {
    const spinner = createSpinner('Checking your answer...').start();
    await sleep();

    if (isCorrect) {
        spinner.success({ text: `Nice work ${playerName}! You are closer to the job!` });
    } else {
        spinner.error({ text: `HEHE! Sorry ${playerName}! You are not getting the job!` });
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
    await question1();
    winner();
}

function winner() {
    console.clear();
    const msg = `Congrats, ${playerName}! You are hired! \n$ 1,000,000`;

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
